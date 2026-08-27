import { z } from "zod";

export const blockByUserIdSchema = z.object({
  params: z.object({
    targetUserId: z.string().min(1)
  }),
  body: z.object({
    reasonNote: z.string().trim().min(1).max(400).optional()
  })
});

export const unblockByUserIdSchema = z.object({
  params: z.object({
    targetUserId: z.string().min(1)
  })
});

export const listMyBlockedUsersSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

export type BlockByUserIdParams = z.infer<typeof blockByUserIdSchema>["params"];
export type BlockByUserIdBody = z.infer<typeof blockByUserIdSchema>["body"];
export type UnblockByUserIdParams = z.infer<typeof unblockByUserIdSchema>["params"];
