import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../../src/app";

const prisma = new PrismaClient();
const shouldRun = process.env.RUN_INTEGRATION_TESTS === "true";
const integrationDescribe = shouldRun ? describe : describe.skip;

const createdEmails: string[] = [];

function randomEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerAndConfirmUser(prefix: string): Promise<{ email: string; cookie: string }> {
  const email = randomEmail(prefix);
  createdEmails.push(email);

  const registerResponse = await request(app)
    .post("/api/v1/auth/register")
    .send({
      firstName: "Bug",
      lastName: "Reporter",
      email,
      password: "Password123!"
    });

  expect(registerResponse.status).toBe(201);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  expect(user?.emailVerificationToken).toBeTruthy();

  await request(app).get(
    `/api/v1/auth/confirm?token=${encodeURIComponent(user!.emailVerificationToken!)}`
  );

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email,
      password: "Password123!"
    });

  expect(loginResponse.status).toBe(200);

  const setCookie = loginResponse.headers["set-cookie"] as string[] | undefined;
  const cookie = setCookie?.[0];

  if (!cookie) {
    throw new Error("Missing auth cookie in login response");
  }

  return { email, cookie };
}

integrationDescribe("support bug reports integration", () => {
  it("creates an authenticated bug report with screenshot attachments", async () => {
    const user = await registerAndConfirmUser("support-bug-report");

    const response = await request(app)
      .post("/api/v1/support/bug-reports")
      .set("Cookie", user.cookie)
      .field("title", "Guardar perfil no responde")
      .field("description", "Abrí perfil, edité el campo empresa y el botón Guardar no hizo nada.")
      .field("pageUrl", "http://localhost:3000/perfil?tab=experiencia")
      .attach(
        "screenshots",
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn9N1kAAAAASUVORK5CYII=",
          "base64"
        ),
        {
          filename: "captura.png",
          contentType: "image/png"
        }
      );

    expect(response.status).toBe(201);
    expect(response.body?.message).toBe("BUG_REPORT_CREATED");
    expect(response.body?.data?.title).toBe("Guardar perfil no responde");
    expect(response.body?.data?.pageUrl).toBe("http://localhost:3000/perfil?tab=experiencia");
    expect(response.body?.data?.attachments).toHaveLength(1);

    const storedBugReport = await prisma.bugReport.findFirst({
      where: {
        user: {
          email: user.email
        }
      },
      include: {
        attachments: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    expect(storedBugReport).not.toBeNull();
    expect(storedBugReport?.title).toBe("Guardar perfil no responde");
    expect(storedBugReport?.details).toContain("Guardar no hizo nada");
    expect(storedBugReport?.pageUrl).toBe("http://localhost:3000/perfil?tab=experiencia");
    expect(storedBugReport?.attachments).toHaveLength(1);
    expect(storedBugReport?.attachments[0]?.mimeType).toBe("image/png");
    expect(storedBugReport?.attachments[0]?.fileData).toBeInstanceOf(Buffer);
  });
});

afterAll(async () => {
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