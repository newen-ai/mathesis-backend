import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { afterAll, afterEach, describe, expect, it } from "vitest";
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

integrationDescribe("email confirmation integration", () => {
  it("marks a user email as verified when the confirmation link is visited", async () => {
    const email = randomEmail("confirm-email");
    createdEmails.push(email);
    canonicalEmails.add(toCanonicalEmail(email));

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password: "Password123!" });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body?.data?.verificationUrl).toContain("/confirm?token=");

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

  it("changes the password, keeps current session active, and invalidates other sessions", async () => {
    const email = randomEmail("change-password");
    createdEmails.push(email);
    canonicalEmails.add(toCanonicalEmail(email));

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password: "Password123!" });

    expect(registerResponse.status).toBe(201);

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
  // no-op placeholder to keep the test lifecycle explicit
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
