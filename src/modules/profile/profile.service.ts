import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import type { UpdateMyProfileBody } from "./profile.schemas";
import type { MyProfileOutput, ProfileOutput, ProfileWithWorkExperiences } from "./profile.types";

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
      company: experience.company,
      jobTitle: experience.jobTitle,
      startYearMonth: experience.startDate,
      endYearMonth: experience.endDate
    }))
  };
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
  }
};
