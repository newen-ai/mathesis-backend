import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/common/prisma";
import { badgeService, BADGE_SLUGS } from "../../src/modules/badge/badge.service";

const createdEmails: string[] = [];

function randomEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerUser(prefix: string): Promise<{ userId: string; cookie: string }> {
  const email = randomEmail(prefix);
  createdEmails.push(email);

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({ email, password: "Password123!" });

  expect(response.status).toBe(201);
  expect(response.body?.success).toBe(true);

  const setCookie = response.headers["set-cookie"] as string[] | undefined;
  const cookie = setCookie?.[0];

  if (!cookie) {
    throw new Error("Missing auth cookie in register response");
  }

  return {
    userId: response.body.data.user.id as string,
    cookie,
  };
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe("enterprise directory integration", () => {
  it("lists enterprises for users with the Mensa Empresarios badge and hides others", async () => {
    const regularUser = await registerUser("regular-directory");
    const badgeUser = await registerUser("badge-directory");

    const regularEnterprise = await request(app)
      .post("/api/v1/enterprises")
      .set("Cookie", regularUser.cookie)
      .send({
        companyName: "Regular Company",
        role: "CEO",
        website: "https://regular.example",
        description: "Not directory visible",
      });

    expect(regularEnterprise.status).toBe(201);

    await badgeService.grantBadge(badgeUser.userId, BADGE_SLUGS.MENSA_EMPRESARIOS);

    const badgeEnterprise = await request(app)
      .post("/api/v1/enterprises")
      .set("Cookie", badgeUser.cookie)
      .send({
        companyName: "Verified Startup",
        role: "Co-Founder",
        website: "https://verified.example",
        description: "Visible in the directory",
      });

    expect(badgeEnterprise.status).toBe(201);

    const response = await request(app)
      .get("/api/v1/enterprises/directory")
      .set("Cookie", badgeUser.cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const visibleNames = (response.body.data.enterprises as Array<{ name: string }>).map((enterprise) => enterprise.name);
    expect(visibleNames).toContain("Verified Startup");
    expect(visibleNames).not.toContain("Regular Company");
  });
});
