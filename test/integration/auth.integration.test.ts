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

integrationDescribe("email confirmation integration", () => {
  it("marks a user email as verified when the confirmation link is visited", async () => {
    const email = randomEmail("confirm-email");
    createdEmails.push(email);
    canonicalEmails.add(toCanonicalEmail(email));

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({ firstName: "Test", lastName: "User", email, password: "Password123!" });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body?.data?.user?.email).toBe(email);

    const storedUser = await prisma.user.findUnique({
      where: { email }
    });

    expect(storedUser?.emailVerificationToken).toBeTruthy();

    const confirmResponse = await request(app).get(
      `/api/v1/auth/confirm?token=${encodeURIComponent(storedUser!.emailVerificationToken!)}`
    );

    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body?.message).toBe("EMAIL_VERIFIED");

    const updatedUser = await prisma.user.findUnique({
      where: { email }
    });

    expect(updatedUser?.emailVerifiedAt).not.toBeNull();
    expect(updatedUser?.emailVerificationToken).toBeNull();
  });

  it("blocks login when the user's email is not yet verified", async () => {
    const email = randomEmail("login-unverified");
    createdEmails.push(email);
    canonicalEmails.add(toCanonicalEmail(email));

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({ firstName: "Unverified", lastName: "User", email, password: "Password123!" });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!"
    });

    expect(loginResponse.status).toBe(403);
    expect(loginResponse.body?.details?.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("blocks login when whitelist is enabled and the user is not whitelisted", async () => {
    env.WHITELIST_ENABLED = true;
    const email = randomEmail("login-whitelist");
    createdEmails.push(email);
    canonicalEmails.add(toCanonicalEmail(email));

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({ firstName: "Whitelist", lastName: "User", email, password: "Password123!" });

    expect(registerResponse.status).toBe(201);

    const storedUser = await prisma.user.findUnique({
      where: { email }
    });

    await request(app).get(`/api/v1/auth/confirm?token=${encodeURIComponent(storedUser!.emailVerificationToken!)}`);

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!"
    });

    expect(loginResponse.status).toBe(403);
    expect(loginResponse.body?.details?.code).toBe("USER_NOT_WHITELISTED");
  });

  it("changes the password, keeps current session active, and invalidates other sessions", async () => {
    const email = randomEmail("change-password");
    createdEmails.push(email);
    canonicalEmails.add(toCanonicalEmail(email));

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({ firstName: "Password", lastName: "User", email, password: "Password123!" });

    expect(registerResponse.status).toBe(201);

    const storedUser = await prisma.user.findUnique({
      where: { email }
    });

    await request(app).get(`/api/v1/auth/confirm?token=${encodeURIComponent(storedUser!.emailVerificationToken!)}`);

    const currentSessionAgent = request.agent(app);
    const otherSessionAgent = request.agent(app);

    const loginResponse = await currentSessionAgent.post("/api/v1/auth/login").send({
      email,
      password: "Password123!"
    });

    expect(loginResponse.status).toBe(200);

    const otherLoginResponse = await otherSessionAgent.post("/api/v1/auth/login").send({
      email,
      password: "Password123!"
    });

    expect(otherLoginResponse.status).toBe(200);

    const changePasswordResponse = await currentSessionAgent.post("/api/v1/auth/change-password").send({
      currentPassword: "Password123!",
      newPassword: "NewPassword456!"
    });

    expect(changePasswordResponse.status).toBe(200);
    expect(changePasswordResponse.body?.message).toBe("PASSWORD_CHANGED");

    const currentSessionResponse = await currentSessionAgent.get("/api/v1/auth/session");
    expect(currentSessionResponse.status).toBe(200);

    const otherSessionResponse = await otherSessionAgent.get("/api/v1/auth/session");
    expect(otherSessionResponse.status).toBe(401);

    const oldPasswordLoginResponse = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!"
    });

    expect(oldPasswordLoginResponse.status).toBe(401);

    const newPasswordLoginResponse = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "NewPassword456!"
    });

    expect(newPasswordLoginResponse.status).toBe(200);
  });
});

afterEach(() => {
  env.WHITELIST_ENABLED = originalWhitelistEnabled;
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
