import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import type { UpdateMyProfileBody, UpdateMyWorkExperiencesBody } from "./profile.schemas";
import type {
  EditWorkExperienceOperationInput,
  MyProfileOutput,
  ProfileOutput,
  ProfileWithWorkExperiences,
  WorkExperienceOperationInput
} from "./profile.types";

const prisma = new PrismaClient();

function buildProfileWriteData(input: UpdateMyProfileBody) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth,
    nationality: input.nationality,
    currentJobTitle: input.currentJobTitle,
    currentCompany: input.currentCompany
  };
}

function mapProfile(profile: ProfileWithWorkExperiences | null): ProfileOutput | null {
  if (!profile) {
    return null;
  }

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString() : null,
    nationality: profile.nationality,
    currentJobTitle: profile.currentJobTitle,
    currentCompany: profile.currentCompany,
    employmentHistory: profile.workExperiences.map((experience) => ({
      id: experience.id,
      company: experience.company,
      jobTitle: experience.jobTitle,
      startYearMonth: experience.startDate,
      endYearMonth: experience.endDate
    }))
  };
}

function buildEditWorkExperienceData(operation: EditWorkExperienceOperationInput) {
  return {
    company: operation.company,
    jobTitle: operation.jobTitle,
    startDate: operation.startYearMonth,
    endDate: operation.endYearMonth
  };
}

async function applyWorkExperienceOperation(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  profileId: string,
  operation: WorkExperienceOperationInput
): Promise<void> {
  if (operation.action === "ADD") {
    await tx.workExperience.create({
      data: {
        profileId,
        company: operation.company,
        jobTitle: operation.jobTitle,
        startDate: operation.startYearMonth,
        endDate: operation.endYearMonth
      }
    });
    return;
  }

  if (operation.action === "EDIT") {
    const result = await tx.workExperience.updateMany({
      where: {
        id: operation.id,
        profileId,
        deletedAt: null
      },
      data: buildEditWorkExperienceData(operation)
    });

    if (result.count === 0) {
      throw new AppError("Work experience not found", StatusCodes.NOT_FOUND);
    }

    return;
  }

  const result = await tx.workExperience.updateMany({
    where: {
      id: operation.id,
      profileId,
      deletedAt: null
    },
    data: { deletedAt: new Date() }
  });

  if (result.count === 0) {
    throw new AppError("Work experience not found", StatusCodes.NOT_FOUND);
  }
}

export const profileService = {
  async getMyProfile(userId: string): Promise<MyProfileOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          where: { deletedAt: null },
          include: {
            workExperiences: {
              where: { deletedAt: null },
              orderBy: { startDate: "desc" }
            }
          }
        }
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: mapProfile(user.profile)
    };
  },

  async upsertMyProfile(userId: string, input: UpdateMyProfileBody): Promise<MyProfileOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          firstName: input.firstName ?? "",
          lastName: input.lastName ?? "",
          dateOfBirth: input.dateOfBirth,
          nationality: input.nationality,
          currentJobTitle: input.currentJobTitle,
          currentCompany: input.currentCompany
        },
        update: buildProfileWriteData(input),
        include: {
          workExperiences: {
            where: { deletedAt: null },
            orderBy: { startDate: "desc" }
          }
        }
      });

      if (input.employmentHistory) {
        await tx.workExperience.updateMany({
          where: {
            profileId: profile.id,
            deletedAt: null
          },
          data: { deletedAt: new Date() }
        });

        if (input.employmentHistory.length > 0) {
          await tx.workExperience.createMany({
            data: input.employmentHistory.map((item) => ({
              profileId: profile.id,
              company: item.company,
              jobTitle: item.jobTitle,
              startDate: item.startYearMonth,
              endDate: item.endYearMonth
            }))
          });
        }

        return tx.profile.findUniqueOrThrow({
          where: { id: profile.id },
          include: {
            workExperiences: {
              where: { deletedAt: null },
              orderBy: { startDate: "desc" }
            }
          }
        });
      }

      return profile;
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: mapProfile(updatedProfile)
    };
  },

  async updateMyWorkExperiences(
    userId: string,
    input: UpdateMyWorkExperiencesBody
  ): Promise<MyProfileOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          where: { deletedAt: null }
        }
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    if (!user.profile) {
      throw new AppError("Profile not found", StatusCodes.NOT_FOUND);
    }

    const updatedProfile = await prisma.$transaction(async (tx) => {
      for (const operation of input.operations) {
        await applyWorkExperienceOperation(tx, user.profile!.id, operation);
      }

      return tx.profile.findUniqueOrThrow({
        where: { id: user.profile!.id },
        include: {
          workExperiences: {
            where: { deletedAt: null },
            orderBy: { startDate: "desc" }
          }
        }
      });
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: mapProfile(updatedProfile)
    };
  }
};
