import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import type {
  BlockUserOutput,
  ListMyBlockedUsersOutput,
  UnblockUserOutput
} from "./block.types";

function normalizeReasonNote(reasonNote: string | null | undefined): string | null {
  if (!reasonNote) {
    return null;
  }

  const normalized = reasonNote.trim();
  return normalized.length > 0 ? normalized : null;
}

async function assertActiveUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      deletedAt: true
    }
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }
}

export const blockService = {
  buildBlockedUserIdNotInFilter(blockedUserIds: Set<string>): { notIn: string[] } | undefined {
    if (blockedUserIds.size === 0) {
      return undefined;
    }

    return {
      notIn: [...blockedUserIds]
    };
  },

  async isEitherDirectionBlocked(userOneId: string, userTwoId: string): Promise<boolean> {
    if (userOneId === userTwoId) {
      return false;
    }

    const block = await prisma.userBlock.findFirst({
      where: {
        liftedAt: null,
        OR: [
          {
            blockerUserId: userOneId,
            blockedUserId: userTwoId
          },
          {
            blockerUserId: userTwoId,
            blockedUserId: userOneId
          }
        ]
      },
      select: {
        id: true
      }
    });

    return Boolean(block);
  },

  async getBlockedUserIdsFor(userId: string): Promise<Set<string>> {
    const blocks = await prisma.userBlock.findMany({
      where: {
        liftedAt: null,
        OR: [{ blockerUserId: userId }, { blockedUserId: userId }]
      },
      select: {
        blockerUserId: true,
        blockedUserId: true
      }
    });

    const blockedUserIds = new Set<string>();

    for (const block of blocks) {
      blockedUserIds.add(block.blockerUserId === userId ? block.blockedUserId : block.blockerUserId);
    }

    return blockedUserIds;
  },

  async assertPairNotBlocked(userOneId: string, userTwoId: string, message = "Blocked user relation"): Promise<void> {
    const isBlocked = await this.isEitherDirectionBlocked(userOneId, userTwoId);

    if (isBlocked) {
      throw new AppError(message, StatusCodes.FORBIDDEN, true, {
        code: "USER_BLOCKED"
      });
    }
  },

  async blockUser(currentUserId: string, targetUserId: string, reasonNote: string | null): Promise<BlockUserOutput> {
    if (currentUserId === targetUserId) {
      throw new AppError("You cannot block yourself", StatusCodes.BAD_REQUEST);
    }

    await assertActiveUser(currentUserId);
    await assertActiveUser(targetUserId);

    const normalizedReasonNote = normalizeReasonNote(reasonNote);
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const existingBlock = await tx.userBlock.findUnique({
        where: {
          blockerUserId_blockedUserId: {
            blockerUserId: currentUserId,
            blockedUserId: targetUserId
          }
        },
        select: {
          id: true,
          createdAt: true,
          liftedAt: true
        }
      });

      if (existingBlock && !existingBlock.liftedAt) {
        await tx.userBlock.update({
          where: { id: existingBlock.id },
          data: {
            reasonNote: normalizedReasonNote
          }
        });

        return {
          targetUserId,
          blockedAt: existingBlock.createdAt.toISOString(),
          alreadyBlocked: true
        } satisfies BlockUserOutput;
      }

      if (existingBlock) {
        await tx.userBlock.update({
          where: {
            id: existingBlock.id
          },
          data: {
            reasonNote: normalizedReasonNote,
            createdAt: now,
            liftedAt: null
          }
        });
      } else {
        await tx.userBlock.create({
          data: {
            blockerUserId: currentUserId,
            blockedUserId: targetUserId,
            reasonNote: normalizedReasonNote
          }
        });
      }

      await tx.connection.updateMany({
        where: {
          deletedAt: null,
          OR: [
            {
              userAId: currentUserId,
              userBId: targetUserId
            },
            {
              userAId: targetUserId,
              userBId: currentUserId
            }
          ]
        },
        data: {
          deletedAt: now
        }
      });

      await tx.userBlockAudit.create({
        data: {
          action: "BLOCK",
          actorUserId: currentUserId,
          targetUserId,
          reasonNote: normalizedReasonNote
        }
      });

      return {
        targetUserId,
        blockedAt: now.toISOString(),
        alreadyBlocked: false
      } satisfies BlockUserOutput;
    });

    return result;
  },

  async unblockUser(currentUserId: string, targetUserId: string): Promise<UnblockUserOutput> {
    if (currentUserId === targetUserId) {
      throw new AppError("You cannot unblock yourself", StatusCodes.BAD_REQUEST);
    }

    await assertActiveUser(currentUserId);

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.userBlock.updateMany({
        where: {
          blockerUserId: currentUserId,
          blockedUserId: targetUserId,
          liftedAt: null
        },
        data: {
          liftedAt: now
        }
      });

      if (updated.count === 0) {
        throw new AppError("Blocked user relation not found", StatusCodes.NOT_FOUND);
      }

      await tx.userBlockAudit.create({
        data: {
          action: "UNBLOCK",
          actorUserId: currentUserId,
          targetUserId
        }
      });

      return {
        targetUserId,
        unblockedAt: now.toISOString()
      } satisfies UnblockUserOutput;
    });

    return result;
  },

  async listMyBlockedUsers(currentUserId: string): Promise<ListMyBlockedUsersOutput> {
    await assertActiveUser(currentUserId);

    const blocks = await prisma.userBlock.findMany({
      where: {
        blockerUserId: currentUserId,
        liftedAt: null,
        blocked: {
          deletedAt: null
        }
      },
      include: {
        blocked: {
          select: {
            id: true,
            profile: {
              where: {
                deletedAt: null
              },
              select: {
                firstName: true,
                lastName: true,
                profileImageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      blockedUsers: blocks.map((block) => ({
        userId: block.blocked.id,
        firstName: block.blocked.profile?.firstName ?? null,
        lastName: block.blocked.profile?.lastName ?? null,
        profileImageUrl: block.blocked.profile?.profileImageUrl ?? null,
        blockedAt: block.createdAt.toISOString(),
        reasonNote: block.reasonNote
      }))
    };
  }
};
