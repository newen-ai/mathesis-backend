import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import { blockService } from "../block/block.service";
import type {
  ConnectUserOutput,
  ConnectionUserSummary,
  DisconnectUserOutput,
  MyConnectionsOutput
} from "./connection.types";

function normalizePair(userOneId: string, userTwoId: string): [string, string] {
  return userOneId < userTwoId ? [userOneId, userTwoId] : [userTwoId, userOneId];
}

async function assertActiveUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }
}

function mapConnectionUser(
  currentUserId: string,
  connection: {
    userAId: string;
    createdAt: Date;
    userA: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
        currentJobTitle: string | null;
        currentCompany: string | null;
        deletedAt: Date | null;
      } | null;
    };
    userB: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
        currentJobTitle: string | null;
        currentCompany: string | null;
        deletedAt: Date | null;
      } | null;
    };
  }
): ConnectionUserSummary {
  const otherUser = connection.userAId === currentUserId ? connection.userB : connection.userA;
  const profile = otherUser.profile && !otherUser.profile.deletedAt ? otherUser.profile : null;

  return {
    userId: otherUser.id,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    currentJobTitle: profile?.currentJobTitle ?? null,
    currentCompany: profile?.currentCompany ?? null,
    connectedAt: connection.createdAt.toISOString()
  };
}

export const connectionService = {
  async connectUsers(currentUserId: string, targetUserId: string): Promise<ConnectUserOutput> {
    if (currentUserId === targetUserId) {
      throw new AppError("You cannot connect with yourself", StatusCodes.BAD_REQUEST);
    }

    await assertActiveUser(currentUserId);
    await assertActiveUser(targetUserId);
    await blockService.assertPairNotBlocked(currentUserId, targetUserId, "Blocked users cannot connect");

    const [userAId, userBId] = normalizePair(currentUserId, targetUserId);

    const existingConnection = await prisma.connection.findFirst({
      where: {
        userAId,
        userBId,
        deletedAt: null
      }
    });

    if (existingConnection) {
      return {
        connectedUserId: targetUserId,
        connectedAt: existingConnection.createdAt.toISOString(),
        alreadyConnected: true
      };
    }

    const createdConnection = await prisma.connection.create({
      data: {
        userAId,
        userBId
      }
    });

    return {
      connectedUserId: targetUserId,
      connectedAt: createdConnection.createdAt.toISOString(),
      alreadyConnected: false
    };
  },

  async disconnectUsers(currentUserId: string, targetUserId: string): Promise<DisconnectUserOutput> {
    if (currentUserId === targetUserId) {
      throw new AppError("You cannot disconnect yourself", StatusCodes.BAD_REQUEST);
    }

    await assertActiveUser(currentUserId);

    const [userAId, userBId] = normalizePair(currentUserId, targetUserId);

    const result = await prisma.connection.updateMany({
      where: {
        userAId,
        userBId,
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    });

    if (result.count === 0) {
      throw new AppError("Connection not found", StatusCodes.NOT_FOUND);
    }

    return {
      disconnectedUserId: targetUserId
    };
  },

  async getMyConnections(currentUserId: string): Promise<MyConnectionsOutput> {
    await assertActiveUser(currentUserId);

    const connections = await prisma.connection.findMany({
      where: {
        deletedAt: null,
        OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
        userA: {
          is: {
            deletedAt: null
          }
        },
        userB: {
          is: {
            deletedAt: null
          }
        }
      },
      include: {
        userA: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                currentJobTitle: true,
                currentCompany: true,
                deletedAt: true
              }
            }
          }
        },
        userB: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                currentJobTitle: true,
                currentCompany: true,
                deletedAt: true
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
      connections: connections.map((connection) => mapConnectionUser(currentUserId, connection))
    };
  }
};
