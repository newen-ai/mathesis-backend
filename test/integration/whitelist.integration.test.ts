import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { app } from "../../src/app";
import { env } from "../../src/config/env";
import { toCanonicalEmail } from "../../src/common/utils/email";

const prisma = new PrismaClient();
const shouldRun = process.env.RUN_INTEGRATION_TESTS === "true";
const integrationDescribe = shouldRun ? describe : describe.skip;

const createdEmails: string[] = [];
const canonicalEmails = new Set<string>();
const originalWhitelistEnabled = env.WHITELIST_ENABLED;

function randomEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerUser(prefix: string): Promise<{ email: string; cookie: string }> {
  const email = randomEmail(prefix);
  createdEmails.push(email);
  canonicalEmails.add(toCanonicalEmail(email));

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({ email, password: "password123" });

  expect(response.status).toBe(201);
  const setCookie = response.headers["set-cookie"] as string[] | undefined;
  const cookie = setCookie?.[0];

  if (!cookie) {
    throw new Error("Missing auth cookie in register response");
  }

  return { email, cookie };
}

integrationDescribe("whitelist gate integration", () => {
  it("allows /auth/session with skipWhitelist but blocks protected routes when whitelist is enabled", async () => {
    env.WHITELIST_ENABLED = true;
    const user = await registerUser("skip-whitelist");

    const sessionResponse = await request(app)
      .get("/api/v1/auth/session")
      .set("Cookie", user.cookie);

    expect(sessionResponse.status).toBe(200);

    const profileResponse = await request(app)
      .get("/api/v1/profile/me")
      .set("Cookie", user.cookie);

    expect(profileResponse.status).toBe(403);
    expect(profileResponse.body?.details?.code).toBe("USER_NOT_WHITELISTED");
  });

  it("rechecks whitelist status per request so access opens immediately after approval", async () => {
    env.WHITELIST_ENABLED = true;
    const user = await registerUser("whitelist-recheck");
    const canonicalEmail = toCanonicalEmail(user.email);

    const blockedResponse = await request(app)
      .get("/api/v1/profile/me")
      .set("Cookie", user.cookie);

    expect(blockedResponse.status).toBe(403);

    await prisma.whitelistedEmail.upsert({
      where: { canonicalEmail },
      create: { canonicalEmail },
      update: {}
    });

    const allowedResponse = await request(app)
      .get("/api/v1/profile/me")
      .set("Cookie", user.cookie);

    expect(allowedResponse.status).toBe(200);
  });

  it("allows protected routes when whitelist is disabled", async () => {
    env.WHITELIST_ENABLED = false;
    const user = await registerUser("whitelist-disabled");

    const profileResponse = await request(app)
      .get("/api/v1/profile/me")
      .set("Cookie", user.cookie);

    expect(profileResponse.status).toBe(200);
  });
});

afterEach(() => {
  env.WHITELIST_ENABLED = originalWhitelistEnabled;
});

afterAll(async () => {
  env.WHITELIST_ENABLED = originalWhitelistEnabled;

  if (canonicalEmails.size > 0) {
    await prisma.whitelistedEmail.deleteMany({
      where: {
        canonicalEmail: {
          in: Array.from(canonicalEmails)
        }
      }
    });
  }

  if (createdEmails.length > 0) {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: createdEmails
        }
      }
    });
  }

  await prisma.$disconnect();
});
