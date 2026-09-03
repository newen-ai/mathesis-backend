import { z } from "zod";

const paginationLimitSchema = z.coerce.number().int().min(1).max(100).optional();

export const listNotificationsSchema = z.object({
  query: z.object({
    limit: paginationLimitSchema,
  }),
});

export const notificationByIdSchema = z.object({
  params: z.object({
    notificationId: z.string().min(1),
  }),
});

export const markAllNotificationsAsReadSchema = z.object({
  body: z.object({}).optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsSchema>["query"];
export type NotificationByIdParams = z.infer<typeof notificationByIdSchema>["params"];