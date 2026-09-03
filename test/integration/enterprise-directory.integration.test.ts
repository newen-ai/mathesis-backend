import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/common/prisma";
import { env } from "../../src/config/env";
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

  const setCookieHeader = response.headers["set-cookie"];
  const setCookie = Array.isArray(setCookieHeader) ? setCookieHeader : typeof setCookieHeader === "string" ? [setCookieHeader] : undefined;
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

  it("returns notifications for verified users when limit is provided as a query string", async () => {
    const email = `notification-list-${Date.now()}@example.com`;

    const user = await prisma.user.create({
      data: {
        email,
        canonicalEmail: email,
        passwordHash: "test-password-hash",
        role: "user",
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            firstName: "Notification",
            lastName: "Tester",
          },
        },
      },
      select: { id: true, email: true },
    });

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: "user",
        authSessionVersion: 1,
      },
      env.JWT_ACCESS_SECRET as jwt.Secret,
      {
        expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"],
        algorithm: "HS256",
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      } satisfies jwt.SignOptions
    );

    const response = await request(app)
      .get("/api/v1/notifications?limit=50")
      .set("Cookie", `${env.AUTH_COOKIE_NAME}=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.notifications)).toBe(true);
  });

  it("updates a post reaction notification whenever a feed post's reaction count changes", async () => {
    const author = await prisma.user.create({
      data: {
        email: `feed-author-${Date.now()}@example.com`,
        canonicalEmail: `feed-author-${Date.now()}@example.com`,
        passwordHash: "test-password-hash",
        role: "user",
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            firstName: "Author",
            lastName: "Tester",
          },
        },
      },
      select: { id: true }
    });

    const actor = await prisma.user.create({
      data: {
        email: `feed-actor-${Date.now()}@example.com`,
        canonicalEmail: `feed-actor-${Date.now()}@example.com`,
        passwordHash: "test-password-hash",
        role: "user",
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            firstName: "Actor",
            lastName: "Tester",
          },
        },
      },
      select: { id: true }
    });

    const post = await prisma.feedPost.create({
      data: {
        authorUserId: author.id,
        content: "Example feed post",
      },
      select: { id: true }
    });

    await import("../../src/modules/feed/feed.service").then(({ feedService }) => feedService.toggleReaction(actor.id, post.id, "value"));

    const notificationAfterAdd = await prisma.notification.findFirst({
      where: {
        userId: author.id,
        seedKey: post.id,
      }
    });

    expect(notificationAfterAdd).not.toBeNull();
    expect(notificationAfterAdd?.isRead).toBe(false);
    expect(notificationAfterAdd?.bodyJson).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Tu post recibió " }),
        expect.objectContaining({ text: "1 valoración", isBold: true }),
      ])
    );

    await import("../../src/modules/feed/feed.service").then(({ feedService }) => feedService.toggleReaction(actor.id, post.id, "value"));

    const notificationAfterRemove = await prisma.notification.findFirst({
      where: {
        userId: author.id,
        seedKey: post.id,
      }
    });

    expect(notificationAfterRemove).toBeNull();
  });

  it("creates a notification when an ateneo topic receives a reaction", async () => {
    const author = await prisma.user.create({
      data: {
        email: `ateneo-author-${Date.now()}@example.com`,
        canonicalEmail: `ateneo-author-${Date.now()}@example.com`,
        passwordHash: "test-password-hash",
        role: "user",
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            firstName: "Topic",
            lastName: "Author",
          },
        },
      },
      select: { id: true }
    });

    const actor = await prisma.user.create({
      data: {
        email: `ateneo-actor-${Date.now()}@example.com`,
        canonicalEmail: `ateneo-actor-${Date.now()}@example.com`,
        passwordHash: "test-password-hash",
        role: "user",
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            firstName: "Topic",
            lastName: "Actor",
          },
        },
      },
      select: { id: true }
    });

    const group = await prisma.ateneoGroup.create({
      data: {
        slug: `topic-reaction-${Date.now()}`,
        name: "Grupo de prueba",
        description: "Grupo para notificaciones",
        createdByUserId: author.id,
      },
      select: { id: true }
    });

    await prisma.ateneoGroupMember.createMany({
      data: [
        { groupId: group.id, userId: author.id },
        { groupId: group.id, userId: actor.id },
      ]
    });

    const topic = await prisma.ateneoTopic.create({
      data: {
        groupId: group.id,
        authorUserId: author.id,
        title: "Tema para reaccionar",
        description: "Descripción del tema",
      },
      select: { id: true }
    });

    await import("../../src/modules/ateneo/ateneo.service").then(({ ateneoService }) =>
      ateneoService.toggleTopicReaction(actor.id, { groupId: group.id, topicId: topic.id }, { reactionValue: "value" })
    );

    const reactionNotification = await prisma.notification.findFirst({
      where: {
        userId: author.id,
        seedKey: topic.id,
      }
    });

    expect(reactionNotification).not.toBeNull();
    expect(reactionNotification?.isRead).toBe(false);
    expect(reactionNotification?.bodyJson).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Tu tema recibió " }),
        expect.objectContaining({ text: "1 valoración", isBold: true }),
      ])
    );
  });

  it("creates a badge-approved notification when a user receives the Mensa Empresarios badge", async () => {
    const email = `badge-notification-${Date.now()}@example.com`;

    const user = await prisma.user.create({
      data: {
        email,
        canonicalEmail: email,
        passwordHash: "test-password-hash",
        role: "user"
      },
      select: { id: true }
    });

    await badgeService.grantBadge(user.id, BADGE_SLUGS.MENSA_EMPRESARIOS);

    const notification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: "BADGE_APPROVED",
        seedKey: "badge-approved-me"
      }
    });

    expect(notification).not.toBeNull();
    expect(notification?.bodyJson).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "¡Fuiste aprobado en " }),
        expect.objectContaining({ text: "Mensa Empresarios", isBold: true }),
        expect.objectContaining({ text: "! Ya podés completar el perfil de tu empresa." })
      ])
    );
  });
});
