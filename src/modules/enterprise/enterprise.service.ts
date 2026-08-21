import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import { BADGE_SLUGS } from "../badge/badge.service";
import type { CreateEnterpriseBody, UpdateEnterpriseBody } from "./enterprise.schemas";
import type { EnterpriseDirectoryOutput, EnterpriseOutput } from "./enterprise.types";

function normalizeOptional(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type DirectoryEnterpriseRecord = {
  id: string;
  name: string;
  role: string;
  website: string | null;
  description: string | null;
  owner: {
    profile: {
      firstName: string | null;
      lastName: string | null;
      locationCity: string | null;
    } | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapEnterprise(enterprise: {
  id: string;
  name: string;
  role: string;
  website: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): EnterpriseOutput {
  return {
    id: enterprise.id,
    name: enterprise.name,
    role: enterprise.role,
    website: enterprise.website,
    description: enterprise.description,
    createdAt: enterprise.createdAt.toISOString(),
    updatedAt: enterprise.updatedAt.toISOString()
  };
}

function mapDirectoryEnterprise(enterprise: DirectoryEnterpriseRecord): EnterpriseDirectoryOutput {
  const founder = enterprise.owner?.profile
    ? [enterprise.owner.profile.firstName, enterprise.owner.profile.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || null
    : null;

  return {
    id: enterprise.id,
    name: enterprise.name,
    role: enterprise.role,
    website: enterprise.website,
    description: enterprise.description,
    founder,
    location: enterprise.owner?.profile?.locationCity ?? null,
    badgeSlug: BADGE_SLUGS.MENSA_EMPRESARIOS,
    createdAt: enterprise.createdAt.toISOString(),
    updatedAt: enterprise.updatedAt.toISOString()
  };
}

async function assertActiveUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true }
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }
}

export const enterpriseService = {
  async listMyEnterprises(userId: string): Promise<EnterpriseOutput[]> {
    const enterprises = await prisma.enterprise.findMany({
      where: {
        ownerUserId: userId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return enterprises.map(mapEnterprise);
  },

  async listVerifiedDirectory(): Promise<EnterpriseDirectoryOutput[]> {
    const enterprises = await prisma.enterprise.findMany({
      where: {
        deletedAt: null,
        owner: {
          deletedAt: null,
          badges: {
            some: {
              badgeSlug: BADGE_SLUGS.MENSA_EMPRESARIOS,
              revokedAt: null
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        name: true,
        role: true,
        website: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                locationCity: true
              }
            }
          }
        }
      }
    });

    return enterprises.map(mapDirectoryEnterprise);
  },

  async createEnterprise(userId: string, body: CreateEnterpriseBody): Promise<EnterpriseOutput> {
    await assertActiveUser(userId);

    const created = await prisma.enterprise.create({
      data: {
        ownerUserId: userId,
        name: body.companyName.trim(),
        role: body.role.trim(),
        website: normalizeOptional(body.website),
        description: normalizeOptional(body.description)
      }
    });

    return mapEnterprise(created);
  },

  async updateEnterprise(userId: string, enterpriseId: string, body: UpdateEnterpriseBody): Promise<EnterpriseOutput> {
    const enterprise = await prisma.enterprise.findFirst({
      where: {
        id: enterpriseId,
        ownerUserId: userId,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!enterprise) {
      throw new AppError("Enterprise not found", StatusCodes.NOT_FOUND);
    }

    const updated = await prisma.enterprise.update({
      where: { id: enterpriseId },
      data: {
        name: body.companyName.trim(),
        role: body.role.trim(),
        website: normalizeOptional(body.website),
        description: normalizeOptional(body.description)
      }
    });

    return mapEnterprise(updated);
  },

  async deleteEnterprise(userId: string, enterpriseId: string): Promise<{ id: string }> {
    const enterprise = await prisma.enterprise.findFirst({
      where: {
        id: enterpriseId,
        ownerUserId: userId,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!enterprise) {
      throw new AppError("Enterprise not found", StatusCodes.NOT_FOUND);
    }

    await prisma.enterprise.update({
      where: { id: enterpriseId },
      data: {
        deletedAt: new Date()
      }
    });

    return { id: enterpriseId };
  }
};
