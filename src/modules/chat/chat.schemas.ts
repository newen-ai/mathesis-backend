import { z } from "zod";

const nonEmptyTextSchema = z
  .string()
  .min(1)
  .max(4000)
  .refine((value) => value.trim().length > 0, {
    message: "content cannot be empty"
  });

const paginationLimitSchema = z
  .coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .optional();

export const createDirectChatSchema = z.object({
  body: z.object({
    targetUserId: z.string().min(1)
  })
});

export const createGroupChatSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1)
      .max(120)
      .refine((value) => value.trim().length > 0, {
        message: "title cannot be empty"
      }),
    userIds: z.array(z.string().min(1)).max(100).default([])
  })
});

export const addGroupMembersSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  }),
  body: z.object({
    userIds: z.array(z.string().min(1)).min(1).max(100)
  })
});

export const sendMessageSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  }),
  body: z.object({
    content: nonEmptyTextSchema
  })
});

export const readMessagesSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  }),
  query: z.object({
    limit: paginationLimitSchema,
    cursor: z.string().min(1).optional()
  })
});

export const updateMessageSchema = z.object({
  params: z.object({
    chatId: z.string().min(1),
    messageId: z.string().min(1)
  }),
  body: z.object({
    content: nonEmptyTextSchema
  })
});

export const deleteMessageSchema = z.object({
  params: z.object({
    chatId: z.string().min(1),
    messageId: z.string().min(1)
  })
});

export const exitGroupSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  })
});

export const updateGroupConfigSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  }),
  body: z.object({
    title: z
      .string()
      .min(1)
      .max(120)
      .refine((value) => value.trim().length > 0, {
        message: "title cannot be empty"
      })
  })
});

export const markChatAsReadSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  })
});

const groupAdminBodySchema = z.object({
  userId: z.string().min(1)
});

export const promoteGroupAdminSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  }),
  body: groupAdminBodySchema
});

export const transferGroupAdminSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  }),
  body: groupAdminBodySchema
});

export const listMyChatsSchema = z.object({
  query: z.object({
    limit: paginationLimitSchema
  })
});

export const chatByIdSchema = z.object({
  params: z.object({
    chatId: z.string().min(1)
  })
});

export type CreateDirectChatBody = z.infer<typeof createDirectChatSchema>["body"];
export type CreateGroupChatBody = z.infer<typeof createGroupChatSchema>["body"];
export type AddGroupMembersBody = z.infer<typeof addGroupMembersSchema>["body"];
export type ChatByIdParams = z.infer<typeof chatByIdSchema>["params"];
export type SendMessageBody = z.infer<typeof sendMessageSchema>["body"];
export type ReadMessagesQuery = z.infer<typeof readMessagesSchema>["query"];
export type MessageByIdParams = z.infer<typeof updateMessageSchema>["params"];
export type UpdateMessageBody = z.infer<typeof updateMessageSchema>["body"];
export type UpdateGroupConfigBody = z.infer<typeof updateGroupConfigSchema>["body"];
export type ListMyChatsQuery = z.infer<typeof listMyChatsSchema>["query"];
export type GroupAdminBody = z.infer<typeof groupAdminBodySchema>;
