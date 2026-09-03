import { Prisma, type Notification } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import type {
  ListNotificationsOutput,
  MarkAllNotificationsAsReadOutput,
  MarkNotificationAsReadOutput,
  NotificationSegmentSummary,
  NotificationSummary,
} from "./notification.types";

const DEFAULT_NOTIFICATIONS_LIMIT = 50;

function parseBodyJson(bodyJson: Prisma.JsonValue): NotificationSegmentSummary[] {
  if (!Array.isArray(bodyJson)) {
    return [];
  }

  return bodyJson.flatMap((segment) => {
    if (!segment || typeof segment !== "object" || Array.isArray(segment)) {
      return [];
    }

    const text = typeof segment.text === "string" ? segment.text : null;

    if (!text) {
      return [];
    }

    return [
      {
        text,
        ...(typeof segment.href === "string" ? { href: segment.href } : {}),
        ...(typeof segment.isBold === "boolean" ? { isBold: segment.isBold } : {}),
      },
    ];
  });
}

function mapNotification(notification: Notification): NotificationSummary {
  return {
    id: notification.id,
    type: notification.type,
    read: notification.isRead,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
    timeLabelOverride: notification.timeLabelOverride,
    lead: {
      kind: notification.leadKind,
      value: notification.leadValue,
      tone: notification.leadTone,
    },
    body: parseBodyJson(notification.bodyJson),
    action:
      notification.actionLabel && notification.actionHref
        ? {
            label: notification.actionLabel,
            href: notification.actionHref,
          }
        : null,
  };
}

async function assertActiveUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true },
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }
}

async function listNotifications(userId: string, limit?: number | string): Promise<ListNotificationsOutput> {
  await assertActiveUser(userId);

  const parsedLimit = typeof limit === "string" ? Number.parseInt(limit, 10) : Number(limit);
  const nextLimit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : DEFAULT_NOTIFICATIONS_LIMIT;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      take: nextLimit,
    }),
    prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    }),
  ]);

  return {
    notifications: notifications.map(mapNotification),
    unreadCount,
  };
}

async function markNotificationAsRead(userId: string, notificationId: string): Promise<MarkNotificationAsReadOutput> {
  await assertActiveUser(userId);

  const existingNotification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!existingNotification) {
    throw new AppError("Notification not found", StatusCodes.NOT_FOUND);
  }

  const notification = existingNotification.isRead
    ? existingNotification
    : await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

  return {
    notification: mapNotification(notification),
  };
}

async function markAllNotificationsAsRead(userId: string): Promise<MarkAllNotificationsAsReadOutput> {
  await assertActiveUser(userId);

  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return {
    updatedCount: result.count,
  };
}

export const notificationService = {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};