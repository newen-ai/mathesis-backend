import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notification.controller";
import {
  listNotificationsSchema,
  markAllNotificationsAsReadSchema,
  notificationByIdSchema,
} from "./notification.schemas";

const notificationRouter = Router();

notificationRouter.get("/", requireAuth(), validateRequest(listNotificationsSchema), asyncHandler(listNotifications));
notificationRouter.post("/read-all", requireAuth(), validateRequest(markAllNotificationsAsReadSchema), asyncHandler(markAllNotificationsAsRead));
notificationRouter.post("/:notificationId/read", requireAuth(), validateRequest(notificationByIdSchema), asyncHandler(markNotificationAsRead));

export { notificationRouter };