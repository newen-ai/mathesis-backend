import {
  NotificationLeadKind,
  NotificationLeadTone,
  NotificationType,
} from "@prisma/client";
import { prisma } from "../../common/prisma";

export const BADGE_SLUGS = {
  MENSA_ARGENTINA: "mensa_argentina",
  MENSA_EMPRESARIOS: "mensa_empresarios"
} as const;

export type BadgeSlug = (typeof BADGE_SLUGS)[keyof typeof BADGE_SLUGS];

async function createMensaEmpresariosApprovalNotification(userId: string): Promise<void> {
  await prisma.notification.upsert({
    where: {
      userId_seedKey: {
        userId,
        seedKey: "badge-approved-me"
      }
    },
    create: {
      userId,
      seedKey: "badge-approved-me",
      type: NotificationType.BADGE_APPROVED,
      leadKind: NotificationLeadKind.SYMBOL,
      leadValue: "∫",
      leadTone: NotificationLeadTone.GOLD,
      bodyJson: [
        { text: "¡Fuiste aprobado en " },
        { text: "Mensa Empresarios", href: "/directorio", isBold: true },
        { text: "! Ya podés completar el perfil de tu empresa." }
      ],
      isRead: false,
    },
    update: {
      type: NotificationType.BADGE_APPROVED,
      leadKind: NotificationLeadKind.SYMBOL,
      leadValue: "∫",
      leadTone: NotificationLeadTone.GOLD,
      bodyJson: [
        { text: "¡Fuiste aprobado en " },
        { text: "Mensa Empresarios", href: "/directorio", isBold: true },
        { text: "! Ya podés completar el perfil de tu empresa." }
      ],
      isRead: false,
      readAt: null,
    },
  });
}

export const badgeService = {
  async grantBadge(userId: string, badgeSlug: BadgeSlug): Promise<void> {
    const existing = await prisma.userBadge.findFirst({
      where: { userId, badgeSlug, revokedAt: null },
      select: { id: true }
    });

    if (existing) return;

    await prisma.userBadge.create({
      data: { userId, badgeSlug }
    });

    if (badgeSlug === BADGE_SLUGS.MENSA_EMPRESARIOS) {
      await createMensaEmpresariosApprovalNotification(userId);
    }
  },

  async revokeBadge(userId: string, badgeSlug: BadgeSlug): Promise<void> {
    const active = await prisma.userBadge.findFirst({
      where: { userId, badgeSlug, revokedAt: null },
      select: { id: true }
    });

    if (!active) return;

    await prisma.userBadge.update({
      where: { id: active.id },
      data: { revokedAt: new Date() }
    });
  },

  async hasActiveBadge(userId: string, badgeSlug: BadgeSlug): Promise<boolean> {
    const row = await prisma.userBadge.findFirst({
      where: { userId, badgeSlug, revokedAt: null },
      select: { id: true }
    });

    return Boolean(row);
  }
};
