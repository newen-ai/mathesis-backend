import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../../src/app";
import { toCanonicalEmail } from "../../src/common/utils/email";

const prisma = new PrismaClient();
const shouldRun = process.env.RUN_INTEGRATION_TESTS === "true";
const integrationDescribe = shouldRun ? describe : describe.skip;

const createdEmails: string[] = [];
const canonicalEmails = new Set<string>();

function randomEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

integrationDescribe("credential verification integration", () => {
  it("issues a signed token and rejects tampered verification attempts", async () => {
    const email = randomEmail("credential");
    createdEmails.push(email);
    canonicalEmails.add(toCanonicalEmail(email));

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password: "Password123!" });

    expect(registerResponse.status).toBe(201);

    const agent = request.agent(app);
    const loginResponse = await agent.post("/api/v1/auth/login").send({
      email,
      password: "Password123!"
    });

    expect(loginResponse.status).toBe(200);

    const tokenResponse = await agent.post("/api/v1/profile/me/credential/verification-token");

    expect(tokenResponse.status).toBe(200);
    expect(tokenResponse.body?.data?.token).toBeTruthy();

    const token = tokenResponse.body.data.token;
    const user = await prisma.user.findUnique({ where: { email } });

    const validResponse = await request(app).get(
      `/api/v1/profile/credential/verify?token=${encodeURIComponent(token)}`
    );

    expect(validResponse.status).toBe(200);
    expect(validResponse.body?.success).toBe(true);
    expect(validResponse.body?.data?.valid).toBe(true);
    expect(validResponse.body?.data?.user?.id).toBe(user?.id);

    const tamperedToken = `${token.slice(0, -1)}X`;
    const invalidResponse = await request(app).get(
      `/api/v1/profile/credential/verify?token=${encodeURIComponent(tamperedToken)}`
    );

    expect(invalidResponse.status).toBe(401);
  });
});

afterAll(async () => {
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
