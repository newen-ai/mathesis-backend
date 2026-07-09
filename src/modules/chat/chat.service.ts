import { ChatMemberRole, ChatType, PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import type {
  AddGroupMembersOutput,
  ChatDetail,
  ChatMemberSummary,
  ChatMessageSummary,
  ChatSummary,
  CreateDirectChatOutput,
  CreateGroupChatOutput,
  DeleteMessageOutput,
  EditMessageOutput,
  ExitGroupOutput,
  ListMyChatsOutput,
  MarkChatAsReadOutput,
  PromoteGroupAdminOutput,
  ReadMessagesOutput,
  SendMessageOutput,
  TransferGroupAdminOutput,
  UpdateGroupConfigOutput
} from "./chat.types";

const prisma = new PrismaClient();
const DEFAULT_CHAT_LIST_LIMIT = 30;
const DEFAULT_MESSAGE_PAGE_LIMIT = 30;

function normalizePair(userOneId: string, userTwoId: string): [string, string] {
  return userOneId < userTwoId ? [userOneId, userTwoId] : [userTwoId, userOneId];
}

function normalizeIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0))];
}

async function assertActiveUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }
}

async function assertAllUsersActive(userIds: string[]): Promise<void> {
  if (userIds.length === 0) {
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds
      },
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (users.length !== userIds.length) {
    throw new AppError("One or more users were not found", StatusCodes.NOT_FOUND);
  }
}

function mapUserSummary(user: {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    currentJobTitle: string | null;
    currentCompany: string | null;
    deletedAt: Date | null;
  } | null;
}) {
  const profile = user.profile && !user.profile.deletedAt ? user.profile : null;

  return {
    userId: user.id,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    currentJobTitle: profile?.currentJobTitle ?? null,
    currentCompany: profile?.currentCompany ?? null
  };
}

function mapMembers(
  members: Array<{
    role: ChatMemberRole;
    joinedAt: Date;
    user: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
        currentJobTitle: string | null;
        currentCompany: string | null;
        deletedAt: Date | null;
      } | null;
    };
  }>
): ChatMemberSummary[] {
  return members.map((member) => ({
    user: mapUserSummary(member.user),
    role: member.role,
    joinedAt: member.joinedAt.toISOString()
  }));
}

function mapMessage(message: {
  id: string;
  chatId: string;
  senderUserId: string;
  content: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  sender: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      currentJobTitle: string | null;
      currentCompany: string | null;
      deletedAt: Date | null;
    } | null;
  };
}): ChatMessageSummary {
  return {
    id: message.id,
    chatId: message.chatId,
    senderUserId: message.senderUserId,
    sender: mapUserSummary(message.sender),
    content: message.deletedAt ? null : message.content,
    isDeleted: Boolean(message.deletedAt),
    editedAt: message.editedAt ? message.editedAt.toISOString() : null,
    createdAt: message.createdAt.toISOString()
  };
}

function mapChatDetail(chat: {
  id: string;
  type: ChatType;
  title: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    role: ChatMemberRole;
    joinedAt: Date;
    user: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
        currentJobTitle: string | null;
        currentCompany: string | null;
        deletedAt: Date | null;
      } | null;
    };
  }>;
}, currentUserId: string): ChatDetail {
  const isAdmin = chat.members.some((member) => member.user.id === currentUserId && member.role === ChatMemberRole.ADMIN);

  return {
    id: chat.id,
    type: chat.type,
    title: chat.type === ChatType.DIRECT ? null : chat.title,
    createdByUserId: chat.createdByUserId,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
    isAdmin,
    members: mapMembers(chat.members)
  };
}

async function getAccessibleChat(currentUserId: string, chatId: string) {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      deletedAt: null,
      members: {
        some: {
          userId: currentUserId,
          leftAt: null,
          deletedAt: null
        }
      }
    },
    include: {
      members: {
        where: {
          leftAt: null,
          deletedAt: null,
          user: {
            deletedAt: null
          }
        },
        select: {
          role: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  currentJobTitle: true,
                  currentCompany: true,
                  deletedAt: true
                }
              }
            }
          }
        },
        orderBy: {
          joinedAt: "asc"
        }
      }
    }
  });

  if (!chat) {
    throw new AppError("Chat not found or inaccessible", StatusCodes.NOT_FOUND);
  }

  return chat;
}

async function getActiveMembership(currentUserId: string, chatId: string) {
  const membership = await prisma.chatMember.findFirst({
    where: {
      chatId,
      userId: currentUserId,
      leftAt: null,
      deletedAt: null,
      chat: {
        deletedAt: null
      }
    },
    select: {
      id: true,
      role: true,
      chat: {
        select: {
          id: true,
          type: true,
          title: true,
          createdByUserId: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true
        }
      }
    }
  });

  if (!membership) {
    throw new AppError("Chat not found or inaccessible", StatusCodes.NOT_FOUND);
  }

  return membership;
}

async function assertGroupAdmin(currentUserId: string, chatId: string): Promise<void> {
  const membership = await prisma.chatMember.findFirst({
    where: {
      chatId,
      userId: currentUserId,
      leftAt: null,
      deletedAt: null,
      chat: {
        deletedAt: null,
        type: ChatType.GROUP
      }
    },
    select: {
      role: true
    }
  });

  if (!membership) {
    throw new AppError("Group not found or inaccessible", StatusCodes.NOT_FOUND);
  }

  if (membership.role !== ChatMemberRole.ADMIN) {
    throw new AppError("Only group admins can perform this action", StatusCodes.FORBIDDEN);
  }
}

async function getUnreadCountsByChat(
  currentUserId: string,
  chatIds: string[]
): Promise<Map<string, number>> {
  if (chatIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.$queryRaw<Array<{ chatId: string; unreadCount: bigint }>>`
    SELECT
      m.chat_id AS "chatId",
      COUNT(*)::bigint AS "unreadCount"
    FROM chat_members m
    JOIN chat_messages msg ON msg.chat_id = m.chat_id
    WHERE m.user_id = ${currentUserId}
      AND m.left_at IS NULL
      AND m.deleted_at IS NULL
      AND msg.deleted_at IS NULL
      AND msg.sender_user_id <> ${currentUserId}
      AND (
        m.last_read_message_at IS NULL
        OR msg.created_at > m.last_read_message_at
      )
      AND m.chat_id = ANY(${chatIds})
    GROUP BY m.chat_id
  `;

  return new Map(rows.map((row) => [row.chatId, Number(row.unreadCount)]));
}

export const chatService = {
  async listMyChats(currentUserId: string, limit?: number): Promise<ListMyChatsOutput> {
    await assertActiveUser(currentUserId);

    const take = limit ?? DEFAULT_CHAT_LIST_LIMIT;

    const memberships = await prisma.chatMember.findMany({
      where: {
        userId: currentUserId,
        leftAt: null,
        deletedAt: null,
        chat: {
          deletedAt: null
        }
      },
      select: {
        role: true,
        lastReadMessageAt: true,
        chat: {
          select: {
            id: true,
            type: true,
            title: true,
            messages: {
              take: 1,
              orderBy: {
                createdAt: "desc"
              },
              select: {
                content: true,
                createdAt: true,
                deletedAt: true
              }
            },
            _count: {
              select: {
                members: {
                  where: {
                    leftAt: null,
                    deletedAt: null
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        chat: {
          updatedAt: "desc"
        }
      },
      take
    });

    const unreadByChatId = await getUnreadCountsByChat(
      currentUserId,
      memberships.map((membership) => membership.chat.id)
    );

    const chats: ChatSummary[] = memberships.map((membership) => {
      const lastMessage = membership.chat.messages[0];

      return {
        id: membership.chat.id,
        type: membership.chat.type,
        title: membership.chat.type === ChatType.DIRECT ? null : membership.chat.title,
        isAdmin: membership.role === ChatMemberRole.ADMIN,
        membersCount: membership.chat._count.members,
        unreadMessagesCount: unreadByChatId.get(membership.chat.id) ?? 0,
        lastMessageAt: lastMessage ? lastMessage.createdAt.toISOString() : null,
        lastMessagePreview: lastMessage
          ? lastMessage.deletedAt
            ? "Message deleted"
            : lastMessage.content
          : null
      };
    });

    return { chats };
  },

  async getChatById(currentUserId: string, chatId: string): Promise<ChatDetail> {
    await assertActiveUser(currentUserId);
    const chat = await getAccessibleChat(currentUserId, chatId);
    return mapChatDetail(chat, currentUserId);
  },

  async createDirectChat(currentUserId: string, targetUserId: string): Promise<CreateDirectChatOutput> {
    if (currentUserId === targetUserId) {
      throw new AppError("You cannot create a direct chat with yourself", StatusCodes.BAD_REQUEST);
    }

    await assertActiveUser(currentUserId);
    await assertActiveUser(targetUserId);

    const [lowUserId, highUserId] = normalizePair(currentUserId, targetUserId);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.chat.findFirst({
        where: {
          type: ChatType.DIRECT,
          directUserLowId: lowUserId,
          directUserHighId: highUserId,
          deletedAt: null
        },
        include: {
          members: {
            where: {
              user: {
                deletedAt: null
              }
            },
            select: {
              role: true,
              joinedAt: true,
              user: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      currentJobTitle: true,
                      currentCompany: true,
                      deletedAt: true
                    }
                  }
                }
              }
            },
            orderBy: {
              joinedAt: "asc"
            }
          }
        }
      });

      if (existing) {
        await tx.chatMember.updateMany({
          where: {
            chatId: existing.id,
            userId: {
              in: [currentUserId, targetUserId]
            }
          },
          data: {
            leftAt: null,
            deletedAt: null
          }
        });

        const refreshed = await tx.chat.findUniqueOrThrow({
          where: {
            id: existing.id
          },
          include: {
            members: {
              where: {
                leftAt: null,
                deletedAt: null,
                user: {
                  deletedAt: null
                }
              },
              select: {
                role: true,
                joinedAt: true,
                user: {
                  select: {
                    id: true,
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                        currentJobTitle: true,
                        currentCompany: true,
                        deletedAt: true
                      }
                    }
                  }
                }
              },
              orderBy: {
                joinedAt: "asc"
              }
            }
          }
        });

        return {
          alreadyExisted: true,
          chat: refreshed
        };
      }

      const created = await tx.chat.create({
        data: {
          type: ChatType.DIRECT,
          createdByUserId: currentUserId,
          directUserLowId: lowUserId,
          directUserHighId: highUserId,
          members: {
            create: [
              {
                userId: currentUserId,
                role: ChatMemberRole.MEMBER
              },
              {
                userId: targetUserId,
                role: ChatMemberRole.MEMBER
              }
            ]
          }
        },
        include: {
          members: {
            where: {
              leftAt: null,
              deletedAt: null,
              user: {
                deletedAt: null
              }
            },
            select: {
              role: true,
              joinedAt: true,
              user: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      currentJobTitle: true,
                      currentCompany: true,
                      deletedAt: true
                    }
                  }
                }
              }
            },
            orderBy: {
              joinedAt: "asc"
            }
          }
        }
      });

      return {
        alreadyExisted: false,
        chat: created
      };
    });

    return {
      alreadyExisted: result.alreadyExisted,
      chat: mapChatDetail(result.chat, currentUserId)
    };
  },

  async createGroupChat(
    currentUserId: string,
    title: string,
    inputUserIds: string[]
  ): Promise<CreateGroupChatOutput> {
    await assertActiveUser(currentUserId);

    const normalizedIds = normalizeIds(inputUserIds);
    const memberUserIds = normalizedIds.filter((id) => id !== currentUserId);

    await assertAllUsersActive(memberUserIds);

    const groupTitle = title.trim();

    const createdGroup = await prisma.chat.create({
      data: {
        type: ChatType.GROUP,
        title: groupTitle,
        createdByUserId: currentUserId,
        members: {
          create: [
            {
              userId: currentUserId,
              role: ChatMemberRole.ADMIN
            },
            ...memberUserIds.map((userId) => ({
              userId,
              role: ChatMemberRole.MEMBER
            }))
          ]
        }
      },
      include: {
        members: {
          where: {
            leftAt: null,
            deletedAt: null,
            user: {
              deletedAt: null
            }
          },
          select: {
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    currentJobTitle: true,
                    currentCompany: true,
                    deletedAt: true
                  }
                }
              }
            }
          },
          orderBy: {
            joinedAt: "asc"
          }
        }
      }
    });

    return {
      chat: mapChatDetail(createdGroup, currentUserId)
    };
  },

  async addGroupMembers(
    currentUserId: string,
    chatId: string,
    inputUserIds: string[]
  ): Promise<AddGroupMembersOutput> {
    await assertActiveUser(currentUserId);
    await assertGroupAdmin(currentUserId, chatId);

    const userIds = normalizeIds(inputUserIds).filter((id) => id !== currentUserId);

    if (userIds.length === 0) {
      throw new AppError("No valid users provided", StatusCodes.BAD_REQUEST);
    }

    await assertAllUsersActive(userIds);

    const existingActiveMembers = await prisma.chatMember.findMany({
      where: {
        chatId,
        userId: {
          in: userIds
        },
        leftAt: null,
        deletedAt: null
      },
      select: {
        userId: true
      }
    });

    if (existingActiveMembers.length > 0) {
      throw new AppError(
        "GROUP_MEMBER_ALREADY_EXISTS",
        StatusCodes.BAD_REQUEST,
        true,
        {
          userIds: existingActiveMembers.map((member) => member.userId)
        }
      );
    }

    const latestMessage = await prisma.chatMessage.findFirst({
      where: {
        chatId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        createdAt: true
      }
    });

    await prisma.$transaction(async (tx) => {
      for (const userId of userIds) {
        await tx.chatMember.upsert({
          where: {
            chatId_userId: {
              chatId,
              userId
            }
          },
          update: {
            leftAt: null,
            deletedAt: null,
            lastReadMessageAt: latestMessage?.createdAt ?? null
          },
          create: {
            chatId,
            userId,
            role: ChatMemberRole.MEMBER,
            lastReadMessageAt: latestMessage?.createdAt ?? null
          }
        });
      }
    });

    const group = await getAccessibleChat(currentUserId, chatId);

    if (group.type !== ChatType.GROUP) {
      throw new AppError("Users can only be added to group chats", StatusCodes.BAD_REQUEST);
    }

    return {
      chatId: group.id,
      members: mapMembers(group.members)
    };
  },

  async sendMessage(currentUserId: string, chatId: string, content: string): Promise<SendMessageOutput> {
    await assertActiveUser(currentUserId);
    await getActiveMembership(currentUserId, chatId);

    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        senderUserId: currentUserId,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                currentJobTitle: true,
                currentCompany: true,
                deletedAt: true
              }
            }
          }
        }
      }
    });

    return {
      message: mapMessage(message)
    };
  },

  async readMessages(
    currentUserId: string,
    chatId: string,
    limit?: number,
    cursor?: string
  ): Promise<ReadMessagesOutput> {
    await assertActiveUser(currentUserId);
    await getActiveMembership(currentUserId, chatId);

    const take = limit ?? DEFAULT_MESSAGE_PAGE_LIMIT;

    if (cursor) {
      const cursorMessage = await prisma.chatMessage.findFirst({
        where: {
          id: cursor,
          chatId
        },
        select: {
          id: true
        }
      });

      if (!cursorMessage) {
        throw new AppError("MESSAGE_CURSOR_INVALID", StatusCodes.BAD_REQUEST);
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        chatId
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                currentJobTitle: true,
                currentCompany: true,
                deletedAt: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: take + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor
            },
            skip: 1
          }
        : {})
    });

    const hasNext = messages.length > take;
    const pagedMessages = hasNext ? messages.slice(0, take) : messages;

    return {
      messages: pagedMessages.map((message) => mapMessage(message)),
      nextCursor: hasNext ? pagedMessages[pagedMessages.length - 1]?.id ?? null : null
    };
  },

  async markChatAsRead(currentUserId: string, chatId: string): Promise<MarkChatAsReadOutput> {
    await assertActiveUser(currentUserId);
    const membership = await getActiveMembership(currentUserId, chatId);

    const latestMessage = await prisma.chatMessage.findFirst({
      where: {
        chatId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        createdAt: true
      }
    });

    await prisma.chatMember.update({
      where: {
        id: membership.id
      },
      data: {
        lastReadMessageAt: latestMessage?.createdAt ?? null
      }
    });

    return {
      chatId,
      lastReadMessageAt: latestMessage ? latestMessage.createdAt.toISOString() : null,
      unreadMessagesCount: 0
    };
  },

  async editMessage(
    currentUserId: string,
    chatId: string,
    messageId: string,
    content: string
  ): Promise<EditMessageOutput> {
    await assertActiveUser(currentUserId);
    await getActiveMembership(currentUserId, chatId);

    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        chatId
      },
      select: {
        id: true,
        senderUserId: true,
        deletedAt: true
      }
    });

    if (!existingMessage) {
      throw new AppError("Message not found", StatusCodes.NOT_FOUND);
    }

    if (existingMessage.senderUserId !== currentUserId) {
      throw new AppError("Only the message sender can edit the message", StatusCodes.FORBIDDEN);
    }

    if (existingMessage.deletedAt) {
      throw new AppError("Deleted messages cannot be edited", StatusCodes.BAD_REQUEST);
    }

    const updated = await prisma.chatMessage.update({
      where: {
        id: messageId
      },
      data: {
        content: content.trim(),
        editedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                currentJobTitle: true,
                currentCompany: true,
                deletedAt: true
              }
            }
          }
        }
      }
    });

    return {
      message: mapMessage(updated)
    };
  },

  async deleteMessage(currentUserId: string, chatId: string, messageId: string): Promise<DeleteMessageOutput> {
    await assertActiveUser(currentUserId);
    await getActiveMembership(currentUserId, chatId);

    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        chatId
      },
      select: {
        id: true,
        senderUserId: true,
        deletedAt: true
      }
    });

    if (!existingMessage) {
      throw new AppError("Message not found", StatusCodes.NOT_FOUND);
    }

    if (existingMessage.senderUserId !== currentUserId) {
      throw new AppError("Only the message sender can delete the message", StatusCodes.FORBIDDEN);
    }

    if (existingMessage.deletedAt) {
      throw new AppError("Message already deleted", StatusCodes.BAD_REQUEST);
    }

    const deletedAt = new Date();

    await prisma.chatMessage.update({
      where: {
        id: messageId
      },
      data: {
        deletedAt,
        deletedByUserId: currentUserId
      }
    });

    return {
      messageId,
      chatId,
      deletedAt: deletedAt.toISOString()
    };
  },

  async exitGroup(currentUserId: string, chatId: string): Promise<ExitGroupOutput> {
    await assertActiveUser(currentUserId);

    const membership = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId: currentUserId,
        leftAt: null,
        deletedAt: null,
        chat: {
          deletedAt: null
        }
      },
      select: {
        id: true,
        role: true,
        chat: {
          select: {
            id: true,
            type: true
          }
        }
      }
    });

    if (!membership) {
      throw new AppError("Group not found or inaccessible", StatusCodes.NOT_FOUND);
    }

    if (membership.chat.type !== ChatType.GROUP) {
      throw new AppError("Direct chats cannot be exited", StatusCodes.BAD_REQUEST);
    }

    const activeMemberCount = await prisma.chatMember.count({
      where: {
        chatId,
        leftAt: null,
        deletedAt: null
      }
    });

    if (membership.role === ChatMemberRole.ADMIN && activeMemberCount > 1) {
      throw new AppError(
        "Group admin cannot exit while other members are still active",
        StatusCodes.BAD_REQUEST
      );
    }

    const exitedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.chatMember.update({
        where: {
          id: membership.id
        },
        data: {
          leftAt: exitedAt
        }
      });

      if (activeMemberCount === 1) {
        await tx.chat.update({
          where: {
            id: chatId
          },
          data: {
            deletedAt: exitedAt
          }
        });
      }
    });

    return {
      chatId,
      exitedAt: exitedAt.toISOString()
    };
  },

  async updateGroupConfig(
    currentUserId: string,
    chatId: string,
    title: string
  ): Promise<UpdateGroupConfigOutput> {
    await assertActiveUser(currentUserId);
    await assertGroupAdmin(currentUserId, chatId);

    const updated = await prisma.chat.update({
      where: {
        id: chatId
      },
      data: {
        title: title.trim()
      },
      include: {
        members: {
          where: {
            leftAt: null,
            deletedAt: null,
            user: {
              deletedAt: null
            }
          },
          select: {
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    currentJobTitle: true,
                    currentCompany: true,
                    deletedAt: true
                  }
                }
              }
            }
          },
          orderBy: {
            joinedAt: "asc"
          }
        }
      }
    });

    if (updated.type !== ChatType.GROUP) {
      throw new AppError("Only group chats can be configured", StatusCodes.BAD_REQUEST);
    }

    return {
      chat: mapChatDetail(updated, currentUserId)
    };
  },

  async promoteGroupAdmin(
    currentUserId: string,
    chatId: string,
    targetUserId: string
  ): Promise<PromoteGroupAdminOutput> {
    await assertActiveUser(currentUserId);
    await assertGroupAdmin(currentUserId, chatId);

    const targetMember = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId: targetUserId,
        leftAt: null,
        deletedAt: null,
        chat: {
          deletedAt: null,
          type: ChatType.GROUP
        }
      },
      select: {
        id: true,
        role: true
      }
    });

    if (!targetMember) {
      throw new AppError("Target user is not an active group member", StatusCodes.NOT_FOUND);
    }

    if (targetMember.role !== ChatMemberRole.ADMIN) {
      await prisma.chatMember.update({
        where: {
          id: targetMember.id
        },
        data: {
          role: ChatMemberRole.ADMIN
        }
      });
    }

    const updatedChat = await getAccessibleChat(currentUserId, chatId);

    if (updatedChat.type !== ChatType.GROUP) {
      throw new AppError("Only group chats can have admins", StatusCodes.BAD_REQUEST);
    }

    return {
      chat: mapChatDetail(updatedChat, currentUserId)
    };
  },

  async transferGroupAdmin(
    currentUserId: string,
    chatId: string,
    targetUserId: string
  ): Promise<TransferGroupAdminOutput> {
    await assertActiveUser(currentUserId);

    const currentMembership = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId: currentUserId,
        leftAt: null,
        deletedAt: null,
        chat: {
          deletedAt: null,
          type: ChatType.GROUP
        }
      },
      select: {
        role: true,
        chat: {
          select: {
            createdByUserId: true
          }
        }
      }
    });

    if (!currentMembership) {
      throw new AppError("Group not found or inaccessible", StatusCodes.NOT_FOUND);
    }

    if (currentMembership.role !== ChatMemberRole.ADMIN) {
      throw new AppError("Only group admins can perform this action", StatusCodes.FORBIDDEN);
    }

    if (currentMembership.chat.createdByUserId !== currentUserId) {
      throw new AppError("Only the current group owner can transfer admin ownership", StatusCodes.FORBIDDEN);
    }

    const targetMembership = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId: targetUserId,
        leftAt: null,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!targetMembership) {
      throw new AppError("Target user is not an active group member", StatusCodes.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      await tx.chatMember.update({
        where: {
          id: targetMembership.id
        },
        data: {
          role: ChatMemberRole.ADMIN
        }
      });

      await tx.chat.update({
        where: {
          id: chatId
        },
        data: {
          createdByUserId: targetUserId
        }
      });
    });

    const updatedChat = await getAccessibleChat(currentUserId, chatId);

    return {
      chat: mapChatDetail(updatedChat, currentUserId)
    };
  }
};
