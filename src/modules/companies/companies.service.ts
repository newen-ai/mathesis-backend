import { MensaBadgeRequestStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import { badgeService, BADGE_SLUGS } from "../badge/badge.service";

const COMPANIES_BADGE_SLUG = BADGE_SLUGS.MENSA_EMPRESARIOS;

export const companiesService = {
  // ── Self membership actions ────────────────────────────────────────────────

  async getMembershipState(userId: string) {
    const hasBadge = await badgeService.hasActiveBadge(userId, BADGE_SLUGS.MENSA_EMPRESARIOS);

    const openRequest = await prisma.mensaBadgeRequest.findFirst({
      where: {
        userId,
        badgeSlug: COMPANIES_BADGE_SLUG,
        status: MensaBadgeRequestStatus.PENDING
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true }
    });

    return {
      hasBadge,
      hasOpenRequest: Boolean(openRequest),
      openRequestId: openRequest?.id ?? null,
      openRequestCreatedAt: openRequest?.createdAt ?? null
    };
  },

  async createMyBadgeRequest(userId: string, message?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const hasBadge = await badgeService.hasActiveBadge(userId, BADGE_SLUGS.MENSA_EMPRESARIOS);
    if (hasBadge) {
      throw new AppError("User already has Mensa Empresarios badge", StatusCodes.CONFLICT);
    }

    const existingPending = await prisma.mensaBadgeRequest.findFirst({
      where: {
        userId,
        badgeSlug: COMPANIES_BADGE_SLUG,
        status: MensaBadgeRequestStatus.PENDING
      },
      select: { id: true }
    });

    if (existingPending) {
      throw new AppError("A pending request already exists", StatusCodes.CONFLICT);
    }

    await prisma.mensaBadgeRequest.create({
      data: {
        userId,
        badgeSlug: COMPANIES_BADGE_SLUG,
        message: message?.trim() || null,
        status: MensaBadgeRequestStatus.PENDING
      }
    });
  },

  async cancelMyBadgeRequest(userId: string) {
    const pendingRequest = await prisma.mensaBadgeRequest.findFirst({
      where: {
        userId,
        badgeSlug: COMPANIES_BADGE_SLUG,
        status: MensaBadgeRequestStatus.PENDING
      },
      orderBy: { createdAt: "desc" },
      select: { id: true }
    });

    if (!pendingRequest) {
      throw new AppError("Pending badge request not found", StatusCodes.NOT_FOUND);
    }

    await prisma.mensaBadgeRequest.delete({
      where: { id: pendingRequest.id }
    });
  },

  // ── Badge requests ──────────────────────────────────────────────────────────

  async listBadgeRequests(status: MensaBadgeRequestStatus | "ALL", limit = 50, offset = 0) {
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);

    const rows = await prisma.mensaBadgeRequest.findMany({
      where: status === "ALL" ? { badgeSlug: COMPANIES_BADGE_SLUG } : { badgeSlug: COMPANIES_BADGE_SLUG, status },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      skip: safeOffset,
      select: {
        id: true,
        userId: true,
        badgeSlug: true,
        message: true,
        status: true,
        reviewedByUserId: true,
        reviewedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      badgeSlug: row.badgeSlug,
      message: row.message,
      status: row.status,
      reviewedByUserId: row.reviewedByUserId,
      reviewedAt: row.reviewedAt,
      createdAt: row.createdAt,
      user: {
        id: row.user.id,
        email: row.user.email,
        firstName: row.user.profile?.firstName ?? null,
        lastName: row.user.profile?.lastName ?? null
      }
    }));
  },

  async approveBadgeRequest(requestId: string, actorUserId: string) {
    const request = await prisma.mensaBadgeRequest.findUnique({
      where: { id: requestId },
      select: { id: true, userId: true, status: true, badgeSlug: true }
    });

    if (!request) {
      throw new AppError("Badge request not found", StatusCodes.NOT_FOUND);
    }

    if (request.status !== MensaBadgeRequestStatus.PENDING) {
      throw new AppError("Request is not pending", StatusCodes.CONFLICT);
    }

    await prisma.$transaction(async (tx) => {
      await tx.mensaBadgeRequest.update({
        where: { id: requestId },
        data: {
          status: MensaBadgeRequestStatus.APPROVED,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });
    });

    await badgeService.grantBadge(request.userId, BADGE_SLUGS.MENSA_EMPRESARIOS);
  },

  async rejectBadgeRequest(requestId: string, actorUserId: string) {
    const request = await prisma.mensaBadgeRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true }
    });

    if (!request) {
      throw new AppError("Badge request not found", StatusCodes.NOT_FOUND);
    }

    if (request.status !== MensaBadgeRequestStatus.PENDING) {
      throw new AppError("Request is not pending", StatusCodes.CONFLICT);
    }

    await prisma.mensaBadgeRequest.update({
      where: { id: requestId },
      data: {
        status: MensaBadgeRequestStatus.REJECTED,
        reviewedByUserId: actorUserId,
        reviewedAt: new Date()
      }
    });
  },

  // ── Badge members ────────────────────────────────────────────────────────────

  async listMembers(limit = 50, offset = 0) {
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);

    const badges = await prisma.userBadge.findMany({
      where: { badgeSlug: COMPANIES_BADGE_SLUG, revokedAt: null },
      orderBy: { grantedAt: "desc" },
      take: safeLimit,
      skip: safeOffset,
      select: {
        id: true,
        grantedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            mensaEmpresariosAdminAt: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return badges.map((badge) => ({
      userId: badge.user.id,
      email: badge.user.email,
      firstName: badge.user.profile?.firstName ?? null,
      lastName: badge.user.profile?.lastName ?? null,
      isAdmin: badge.user.mensaEmpresariosAdminAt !== null,
      grantedAt: badge.grantedAt
    }));
  },

  async removeMember(targetUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, deletedAt: true }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    await badgeService.revokeBadge(targetUserId, BADGE_SLUGS.MENSA_EMPRESARIOS);

    // Also remove admin flag if set
    await prisma.user.update({
      where: { id: targetUserId },
      data: { mensaEmpresariosAdminAt: null }
    });
  },

  // ── Companies admins ─────────────────────────────────────────────────────────

  async listAdmins(limit = 50, offset = 0) {
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);

    const users = await prisma.user.findMany({
      where: { mensaEmpresariosAdminAt: { not: null }, deletedAt: null },
      orderBy: { mensaEmpresariosAdminAt: "desc" },
      take: safeLimit,
      skip: safeOffset,
      select: {
        id: true,
        email: true,
        mensaEmpresariosAdminAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return users.map((user) => ({
      userId: user.id,
      email: user.email,
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null,
      adminSince: user.mensaEmpresariosAdminAt
    }));
  },

  async searchEligibleAdmins(query: string, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const normalizedQuery = query.trim();

    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        mensaEmpresariosAdminAt: null,
        ...(normalizedQuery
          ? {
              OR: [
                { email: { contains: normalizedQuery, mode: "insensitive" } },
                {
                  profile: {
                    OR: [
                      { firstName: { contains: normalizedQuery, mode: "insensitive" } },
                      { lastName: { contains: normalizedQuery, mode: "insensitive" } }
                    ]
                  }
                }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return users.map((user) => ({
      userId: user.id,
      email: user.email,
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null
    }));
  },

  async setAdmin(targetUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, deletedAt: true, mensaEmpresariosAdminAt: true }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    if (user.mensaEmpresariosAdminAt !== null) {
      throw new AppError("User is already a companies admin", StatusCodes.CONFLICT);
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { mensaEmpresariosAdminAt: new Date() }
    });

    await badgeService.grantBadge(targetUserId, BADGE_SLUGS.MENSA_EMPRESARIOS);
  },

  async removeAdmin(targetUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, deletedAt: true, mensaEmpresariosAdminAt: true }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    if (user.mensaEmpresariosAdminAt === null) {
      throw new AppError("User is not a companies admin", StatusCodes.NOT_FOUND);
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { mensaEmpresariosAdminAt: null }
    });

    await badgeService.revokeBadge(targetUserId, BADGE_SLUGS.MENSA_EMPRESARIOS);
  }
};
