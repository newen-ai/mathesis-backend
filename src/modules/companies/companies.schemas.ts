import { z } from "zod";

const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const listBadgeRequestsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]).default("PENDING")
  })
});

export const approveBadgeRequestSchema = z.object({
  params: z.object({ requestId: z.string().min(1) })
});

export const rejectBadgeRequestSchema = z.object({
  params: z.object({ requestId: z.string().min(1) })
});

export const listMembersSchema = z.object({
  query: paginationQuerySchema
});

export const removeMemberSchema = z.object({
  params: z.object({ userId: z.string().min(1) })
});

export const listAdminsSchema = z.object({
  query: paginationQuerySchema
});

export const searchEligibleAdminsSchema = z.object({
  query: z.object({
    q: z.string().default(""),
    limit: z.coerce.number().int().min(1).max(50).default(20)
  })
});

export const setAdminSchema = z.object({
  params: z.object({ userId: z.string().min(1) })
});

export const removeAdminSchema = z.object({
  params: z.object({ userId: z.string().min(1) })
});

export const getMembershipStateSchema = z.object({});

export const createMyBadgeRequestSchema = z.object({
  body: z
    .object({
      message: z.string().max(600).optional()
    })
    .optional()
});

export const cancelMyBadgeRequestSchema = z.object({});

export type ListBadgeRequestsQuery = z.infer<typeof listBadgeRequestsSchema>["query"];
export type ApproveBadgeRequestParams = z.infer<typeof approveBadgeRequestSchema>["params"];
export type RejectBadgeRequestParams = z.infer<typeof rejectBadgeRequestSchema>["params"];
export type ListMembersQuery = z.infer<typeof listMembersSchema>["query"];
export type RemoveMemberParams = z.infer<typeof removeMemberSchema>["params"];
export type ListAdminsQuery = z.infer<typeof listAdminsSchema>["query"];
export type SearchEligibleAdminsQuery = z.infer<typeof searchEligibleAdminsSchema>["query"];
export type SetAdminParams = z.infer<typeof setAdminSchema>["params"];
export type RemoveAdminParams = z.infer<typeof removeAdminSchema>["params"];
export type CreateMyBadgeRequestBody = z.infer<typeof createMyBadgeRequestSchema>["body"];
