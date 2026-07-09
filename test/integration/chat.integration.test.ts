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

async function registerUser(prefix: string): Promise<{ userId: string; cookie: string }> {
  const email = randomEmail(prefix);
  createdEmails.push(email);

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({ email, password: "password123" });

  expect(response.status).toBe(201);
  expect(response.body?.success).toBe(true);

  const setCookie = response.headers["set-cookie"] as string[] | undefined;
  const cookie = setCookie?.[0];

  if (!cookie) {
    throw new Error("Missing auth cookie in register response");
  }

  return {
    userId: response.body.data.user.id as string,
    cookie
  };
}

integrationDescribe("chat integration", () => {
  it("tracks unread counters and allows marking chat as read", async () => {
    const alice = await registerUser("alice-unread");
    const bob = await registerUser("bob-unread");

    const directChatResponse = await request(app)
      .post("/api/v1/chats/direct")
      .set("Cookie", alice.cookie)
      .send({ targetUserId: bob.userId });

    expect(directChatResponse.status).toBe(200);
    const chatId = directChatResponse.body.data.chat.id as string;

    const sendMessageResponse = await request(app)
      .post(`/api/v1/chats/${chatId}/messages`)
      .set("Cookie", alice.cookie)
      .send({ content: "Hi Bob" });

    expect(sendMessageResponse.status).toBe(200);

    const listBeforeRead = await request(app)
      .get("/api/v1/chats")
      .set("Cookie", bob.cookie);

    expect(listBeforeRead.status).toBe(200);
    const bobChatBefore = (listBeforeRead.body.data.chats as Array<{ id: string; unreadMessagesCount: number }>).find(
      (chat) => chat.id === chatId
    );

    expect(bobChatBefore?.unreadMessagesCount).toBe(1);

    const markAsReadResponse = await request(app)
      .post(`/api/v1/chats/${chatId}/read`)
      .set("Cookie", bob.cookie)
      .send({});

    expect(markAsReadResponse.status).toBe(200);
    expect(markAsReadResponse.body.data.unreadMessagesCount).toBe(0);

    const listAfterRead = await request(app)
      .get("/api/v1/chats")
      .set("Cookie", bob.cookie);

    expect(listAfterRead.status).toBe(200);
    const bobChatAfter = (listAfterRead.body.data.chats as Array<{ id: string; unreadMessagesCount: number }>).find(
      (chat) => chat.id === chatId
    );

    expect(bobChatAfter?.unreadMessagesCount).toBe(0);
  });

  it("supports admin promote and owner transfer", async () => {
    const owner = await registerUser("owner-admin");
    const memberOne = await registerUser("member-one-admin");
    const memberTwo = await registerUser("member-two-admin");

    const createGroupResponse = await request(app)
      .post("/api/v1/chats/groups")
      .set("Cookie", owner.cookie)
      .send({
        title: "Leadership",
        userIds: [memberOne.userId, memberTwo.userId]
      });

    expect(createGroupResponse.status).toBe(200);
    const chatId = createGroupResponse.body.data.chat.id as string;

    const promoteResponse = await request(app)
      .post(`/api/v1/chats/${chatId}/admins/promote`)
      .set("Cookie", owner.cookie)
      .send({ userId: memberOne.userId });

    expect(promoteResponse.status).toBe(200);

    const promotedMember = (promoteResponse.body.data.chat.members as Array<{ user: { userId: string }; role: string }>).find(
      (member) => member.user.userId === memberOne.userId
    );
    expect(promotedMember?.role).toBe("ADMIN");

    const transferResponse = await request(app)
      .post(`/api/v1/chats/${chatId}/admins/transfer`)
      .set("Cookie", owner.cookie)
      .send({ userId: memberOne.userId });

    expect(transferResponse.status).toBe(200);
    expect(transferResponse.body.data.chat.createdByUserId).toBe(memberOne.userId);

    const transferAgainAsPreviousOwner = await request(app)
      .post(`/api/v1/chats/${chatId}/admins/transfer`)
      .set("Cookie", owner.cookie)
      .send({ userId: memberTwo.userId });

    expect(transferAgainAsPreviousOwner.status).toBe(403);
  });

  it("rejects adding a user who is already in the group", async () => {
    const owner = await registerUser("owner-duplicate-member");
    const member = await registerUser("member-duplicate-member");

    const createGroupResponse = await request(app)
      .post("/api/v1/chats/groups")
      .set("Cookie", owner.cookie)
      .send({
        title: "Existing Members",
        userIds: [member.userId]
      });

    expect(createGroupResponse.status).toBe(200);
    const chatId = createGroupResponse.body.data.chat.id as string;

    const addSameMemberResponse = await request(app)
      .post(`/api/v1/chats/${chatId}/members`)
      .set("Cookie", owner.cookie)
      .send({ userIds: [member.userId] });

    expect(addSameMemberResponse.status).toBe(400);
    expect(addSameMemberResponse.body.message).toBe("GROUP_MEMBER_ALREADY_EXISTS");
    expect(addSameMemberResponse.body.details.userIds).toContain(member.userId);
  });

  it("rejects an invalid message cursor", async () => {
    const alice = await registerUser("alice-invalid-cursor");
    const bob = await registerUser("bob-invalid-cursor");

    const directChatResponse = await request(app)
      .post("/api/v1/chats/direct")
      .set("Cookie", alice.cookie)
      .send({ targetUserId: bob.userId });

    expect(directChatResponse.status).toBe(200);
    const chatId = directChatResponse.body.data.chat.id as string;

    const sendMessageResponse = await request(app)
      .post(`/api/v1/chats/${chatId}/messages`)
      .set("Cookie", alice.cookie)
      .send({ content: "Hello" });

    expect(sendMessageResponse.status).toBe(200);

    const invalidCursorResponse = await request(app)
      .get(`/api/v1/chats/${chatId}/messages?limit=10&cursor=0`)
      .set("Cookie", bob.cookie);

    expect(invalidCursorResponse.status).toBe(400);
    expect(invalidCursorResponse.body.message).toBe("MESSAGE_CURSOR_INVALID");
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
