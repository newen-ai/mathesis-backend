import { WhitelistRequestStatus } from "@prisma/client";
import { z } from "zod";

const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const listWhitelistedEmailsSchema = z.object({
  query: paginationQuerySchema
});

export const listUsersByWhitelistStateSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(["whitelisted", "non-whitelisted"])
  })
});

export const promoteUserToWhitelistSchema = z.object({
  params: z.object({
    userId: z.string().min(1)
  }),
  body: z.object({
    reason: z.string().min(3).max(500)
  })
});

export const approveWhitelistRequestSchema = z.object({
  params: z.object({
    requestId: z.string().min(1)
  }),
  body: z.object({
    reason: z.string().min(3).max(500).optional()
  })
});

export const listWhitelistRequestsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(["ALL", ...Object.values(WhitelistRequestStatus)]).default("PENDING")
  })
});

export const createWhitelistRequestSchema = z.object({
  body: z.object({
    message: z.string().min(3).max(500).optional()
  })
});

export type ListWhitelistedEmailsQuery = z.infer<typeof listWhitelistedEmailsSchema>["query"];
export type ListUsersByWhitelistStateQuery = z.infer<typeof listUsersByWhitelistStateSchema>["query"];
export type PromoteUserToWhitelistParams = z.infer<typeof promoteUserToWhitelistSchema>["params"];
export type PromoteUserToWhitelistBody = z.infer<typeof promoteUserToWhitelistSchema>["body"];
export type ApproveWhitelistRequestParams = z.infer<typeof approveWhitelistRequestSchema>["params"];
export type ApproveWhitelistRequestBody = z.infer<typeof approveWhitelistRequestSchema>["body"];
export type ListWhitelistRequestsQuery = z.infer<typeof listWhitelistRequestsSchema>["query"];
export type CreateWhitelistRequestBody = z.infer<typeof createWhitelistRequestSchema>["body"];
