import { prisma } from "../../common/prisma";

export const BADGE_SLUGS = {
  MENSA_ARGENTINA: "mensa_argentina",
  MENSA_EMPRESARIOS: "mensa_empresarios"
} as const;

export type BadgeSlug = (typeof BADGE_SLUGS)[keyof typeof BADGE_SLUGS];

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
