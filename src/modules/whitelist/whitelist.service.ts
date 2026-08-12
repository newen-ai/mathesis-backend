import { WhitelistRequestStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import { badgeService, BADGE_SLUGS } from "../badge/badge.service";

type PaginationInput = {
  limit: number;
  offset: number;
};

const DEFAULT_PAGINATION_LIMIT = 50;
const MAX_PAGINATION_LIMIT = 200;

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizePagination(input: PaginationInput): PaginationInput {
  const rawLimit = toFiniteNumber(input.limit);
  const rawOffset = toFiniteNumber(input.offset);

  const safeLimit = rawLimit === null ? DEFAULT_PAGINATION_LIMIT : rawLimit;
  const safeOffset = rawOffset === null ? 0 : rawOffset;

  return {
    limit: Math.min(Math.max(Math.trunc(safeLimit), 1), MAX_PAGINATION_LIMIT),
    offset: Math.max(Math.trunc(safeOffset), 0)
  };
}

export const whitelistService = {
  async isCanonicalEmailWhitelisted(canonicalEmail: string): Promise<boolean> {
    const row = await prisma.whitelistedEmail.findUnique({
      where: { canonicalEmail },
      select: { id: true }
    });

    return Boolean(row);
  },

  async createWhitelistRequest(userId: string, canonicalEmail: string, message?: string): Promise<{ requestId: string; status: WhitelistRequestStatus }> {
    const existingPending = await prisma.whitelistRequest.findFirst({
      where: {
        userId,
        status: WhitelistRequestStatus.PENDING
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        status: true
      }
    });

    if (existingPending) {
      return {
        requestId: existingPending.id,
        status: existingPending.status
      };
    }

    const request = await prisma.whitelistRequest.create({
      data: {
        userId,
        canonicalEmail,
        message,
        status: WhitelistRequestStatus.PENDING
      },
      select: {
        id: true,
        status: true
      }
    });

    return {
      requestId: request.id,
      status: request.status
    };
  },

  async listWhitelistedEmails(limit: number, offset: number) {
    const paging = normalizePagination({ limit, offset });

    return prisma.whitelistedEmail.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: paging.limit,
      skip: paging.offset,
      select: {
        id: true,
        canonicalEmail: true,
        createdAt: true,
        createdByUserId: true
      }
    });
  },

  async listUsersByWhitelistState(isWhitelisted: boolean, limit: number, offset: number) {
    const paging = normalizePagination({ limit, offset });

    const whitelistedEmails = await prisma.whitelistedEmail.findMany({
      select: {
        canonicalEmail: true
      }
    });

    const canonicalEmails = whitelistedEmails.map((row) => row.canonicalEmail);
    const whereClause =
      canonicalEmails.length === 0
        ? isWhitelisted
          ? {
              deletedAt: null,
              id: "__no_match__"
            }
          : {
              deletedAt: null
            }
        : {
            deletedAt: null,
            canonicalEmail: isWhitelisted
              ? { in: canonicalEmails }
              : { notIn: canonicalEmails }
          };

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc"
      },
      take: paging.limit,
      skip: paging.offset,
      select: {
        id: true,
        email: true,
        canonicalEmail: true,
        role: true,
        createdAt: true
      }
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      canonicalEmail: user.canonicalEmail,
      role: user.role,
      createdAt: user.createdAt,
      isWhitelisted
    }));
  },

  async promoteUserToWhitelist(targetUserId: string, actorUserId: string, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        canonicalEmail: true,
        deletedAt: true
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      await tx.whitelistedEmail.upsert({
        where: { canonicalEmail: user.canonicalEmail },
        create: {
          canonicalEmail: user.canonicalEmail,
          createdByUserId: actorUserId
        },
        update: {}
      });

      await tx.whitelistAudit.create({
        data: {
          action: "PROMOTE_USER",
          canonicalEmail: user.canonicalEmail,
          targetUserId: user.id,
          actorUserId,
          reason
        }
      });

      await tx.whitelistRequest.updateMany({
        where: {
          userId: user.id,
          status: WhitelistRequestStatus.PENDING
        },
        data: {
          status: WhitelistRequestStatus.APPROVED,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });
    });

    await badgeService.grantBadge(targetUserId, BADGE_SLUGS.MENSA_ARGENTINA);

    return {
      id: user.id,
      email: user.email,
      canonicalEmail: user.canonicalEmail,
      isWhitelisted: true
    };
  },

  async approveWhitelistRequest(requestId: string, actorUserId: string, reason?: string) {
    const request = await prisma.whitelistRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        canonicalEmail: true,
        status: true,
        user: {
          select: {
            email: true,
            deletedAt: true
          }
        }
      }
    });

    if (!request || request.user.deletedAt) {
      throw new AppError("Whitelist request not found", StatusCodes.NOT_FOUND);
    }

    if (request.status === WhitelistRequestStatus.APPROVED) {
      return {
        requestId: request.id,
        userId: request.userId,
        canonicalEmail: request.canonicalEmail,
        status: request.status
      };
    }

    if (request.status === WhitelistRequestStatus.REJECTED) {
      throw new AppError("Whitelist request was already rejected", StatusCodes.CONFLICT);
    }

    await prisma.$transaction(async (tx) => {
      await tx.whitelistedEmail.upsert({
        where: { canonicalEmail: request.canonicalEmail },
        create: {
          canonicalEmail: request.canonicalEmail,
          createdByUserId: actorUserId
        },
        update: {}
      });

      await tx.whitelistRequest.update({
        where: { id: request.id },
        data: {
          status: WhitelistRequestStatus.APPROVED,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });

      await tx.whitelistAudit.create({
        data: {
          action: "APPROVE_REQUEST",
          canonicalEmail: request.canonicalEmail,
          targetUserId: request.userId,
          actorUserId,
          reason: reason ?? "Approved from whitelist request"
        }
      });
    });

    await badgeService.grantBadge(request.userId, BADGE_SLUGS.MENSA_ARGENTINA);

    return {
      requestId: request.id,
      userId: request.userId,
      canonicalEmail: request.canonicalEmail,
      status: WhitelistRequestStatus.APPROVED
    };
  },

  async listWhitelistRequests(status: WhitelistRequestStatus | "ALL", limit: number, offset: number) {
    const paging = normalizePagination({ limit, offset });

    return prisma.whitelistRequest.findMany({
      where: status === "ALL" ? undefined : { status },
      orderBy: [{ createdAt: "desc" }],
      take: paging.limit,
      skip: paging.offset,
      select: {
        id: true,
        userId: true,
        canonicalEmail: true,
        message: true,
        status: true,
        reviewedByUserId: true,
        reviewedAt: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });
  }
};
