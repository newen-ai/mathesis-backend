import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type { ListNotificationsQuery, NotificationByIdParams } from "./notification.schemas";
import { notificationService } from "./notification.service";

export const listNotifications: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const query = req.query as ListNotificationsQuery;
  const result = await notificationService.listNotifications(currentUserId, query.limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "NOTIFICATIONS_LISTED",
    data: result,
  });
};

export const markNotificationAsRead: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const notificationId = (req.params as NotificationByIdParams).notificationId;
  const result = await notificationService.markNotificationAsRead(currentUserId, notificationId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "NOTIFICATION_MARKED_AS_READ",
    data: result,
  });
};

export const markAllNotificationsAsRead: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const result = await notificationService.markAllNotificationsAsRead(currentUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ALL_NOTIFICATIONS_MARKED_AS_READ",
    data: result,
  });
};