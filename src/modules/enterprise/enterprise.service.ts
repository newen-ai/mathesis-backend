import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import type { CreateEnterpriseBody, UpdateEnterpriseBody } from "./enterprise.schemas";
import type { EnterpriseOutput } from "./enterprise.types";

function normalizeOptional(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

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
