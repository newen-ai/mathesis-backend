import { type Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import type {
  UpdateMyEducationHistoryBody,
  UpdateMyProfileBody,
  UpdateMyWorkExperiencesBody
} from "./profile.schemas";
import type {
  EditEducationExperienceOperationInput,
  EditWorkExperienceOperationInput,
  EducationExperienceOperationInput,
  MyProfileOutput,
  ProfileOutput,
  ProfileWithWorkExperiences,
  UserSearchResult,
  WorkExperienceOperationInput
} from "./profile.types";

type TransactionClient = Prisma.TransactionClient;

function buildProfileWriteData(input: UpdateMyProfileBody) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth,
    nationality: input.nationality,
    currentJobTitle: input.currentJobTitle,
    currentCompany: input.currentCompany,
    about: input.about,
    locationCountry: input.locationCountry,
    locationCity: input.locationCity,
    locationPostalCode: input.locationPostalCode,
    profileImageUrl: input.profileImageUrl,
    profileBannerImageUrl: input.profileBannerImageUrl
  };
}

function mapProfile(
  profile: ProfileWithWorkExperiences | null,
  badges: Array<{ badgeSlug: string }>
): ProfileOutput | null {
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
    about: profile.about,
    locationCountry: profile.locationCountry,
    locationCity: profile.locationCity,
    locationPostalCode: profile.locationPostalCode,
    profileImageUrl: profile.profileImageUrl,
    profileBannerImageUrl: profile.profileBannerImageUrl,
    badges: badges.map((badge) => ({ slug: badge.badgeSlug })),
    employmentHistory: profile.workExperiences.map((experience) => ({
      id: experience.id,
      company: experience.company,
      jobTitle: experience.jobTitle,
      description: experience.description,
      startYearMonth: experience.startDate,
      endYearMonth: experience.endDate
    })),
    educationHistory: profile.educationExperiences.map((experience) => ({
      id: experience.id,
      institution: experience.institution,
      degree: experience.degree,
      fieldOfStudy: experience.fieldOfStudy,
      startYearMonth: experience.startDate,
      endYearMonth: experience.endDate,
      description: experience.description
    }))
  };
}

function buildEditWorkExperienceData(operation: EditWorkExperienceOperationInput) {
  return {
    company: operation.company,
    jobTitle: operation.jobTitle,
    description: operation.description,
    startDate: operation.startYearMonth,
    endDate: operation.endYearMonth
  };
}

function buildEditEducationData(operation: EditEducationExperienceOperationInput) {
  return {
    institution: operation.institution,
    degree: operation.degree,
    fieldOfStudy: operation.fieldOfStudy,
    startDate: operation.startYearMonth,
    endDate: operation.endYearMonth,
    description: operation.description
  };
}

async function applyWorkExperienceOperation(
  tx: TransactionClient,
  profileId: string,
  operation: WorkExperienceOperationInput
): Promise<void> {
  if (operation.action === "ADD") {
    await tx.workExperience.create({
      data: {
        profileId,
        company: operation.company,
        jobTitle: operation.jobTitle,
        description: operation.description,
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

async function applyEducationOperation(
  tx: TransactionClient,
  profileId: string,
  operation: EducationExperienceOperationInput
): Promise<void> {
  if (operation.action === "ADD") {
    await tx.educationExperience.create({
      data: {
        profileId,
        institution: operation.institution,
        degree: operation.degree,
        fieldOfStudy: operation.fieldOfStudy,
        startDate: operation.startYearMonth,
        endDate: operation.endYearMonth,
        description: operation.description
      }
    });
    return;
  }

  if (operation.action === "EDIT") {
    const result = await tx.educationExperience.updateMany({
      where: {
        id: operation.id,
        profileId,
        deletedAt: null
      },
      data: buildEditEducationData(operation)
    });

    if (result.count === 0) {
      throw new AppError("Education experience not found", StatusCodes.NOT_FOUND);
    }

    return;
  }

  const result = await tx.educationExperience.updateMany({
    where: {
      id: operation.id,
      profileId,
      deletedAt: null
    },
    data: { deletedAt: new Date() }
  });

  if (result.count === 0) {
    throw new AppError("Education experience not found", StatusCodes.NOT_FOUND);
  }
}

export const profileService = {
  async searchUsersByName(text: string): Promise<UserSearchResult[]> {
    const normalizedText = text.trim();
    const tokens = normalizedText.split(/\s+/).filter((token) => token.length > 0);
    const firstToken = tokens[0] ?? "";
    const remainingText = tokens.slice(1).join(" ");

    const orConditions: Prisma.ProfileWhereInput[] = [
      {
        firstName: {
          contains: normalizedText,
          mode: "insensitive"
        }
      },
      {
        lastName: {
          contains: normalizedText,
          mode: "insensitive"
        }
      }
    ];

    if (tokens.length > 1 && remainingText.length > 0) {
      orConditions.push(
        {
          AND: [
            {
              firstName: {
                contains: firstToken,
                mode: "insensitive"
              }
            },
            {
              lastName: {
                contains: remainingText,
                mode: "insensitive"
              }
            }
          ]
        },
        {
          AND: [
            {
              firstName: {
                contains: remainingText,
                mode: "insensitive"
              }
            },
            {
              lastName: {
                contains: firstToken,
                mode: "insensitive"
              }
            }
          ]
        },
        {
          AND: tokens.map((token) => ({
            OR: [
              {
                firstName: {
                  contains: token,
                  mode: "insensitive"
                }
              },
              {
                lastName: {
                  contains: token,
                  mode: "insensitive"
                }
              }
            ]
          }))
        }
      );
    }

    const profiles = await prisma.profile.findMany({
      where: {
        deletedAt: null,
        user: {
          is: {
            deletedAt: null
          }
        },
        OR: orConditions
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      take: 20
    });

    return profiles;
  },

  async getMyProfile(userId: string): Promise<MyProfileOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          where: { revokedAt: null },
          select: { badgeSlug: true },
          orderBy: { grantedAt: "asc" }
        },
        profile: {
          where: { deletedAt: null },
          include: {
            workExperiences: {
              where: { deletedAt: null },
              orderBy: { startDate: "desc" }
            },
            educationExperiences: {
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
      profile: mapProfile(user.profile, user.badges)
    };
  },

  async getProfileByUserId(userId: string): Promise<MyProfileOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          where: { revokedAt: null },
          select: { badgeSlug: true },
          orderBy: { grantedAt: "asc" }
        },
        profile: {
          where: { deletedAt: null },
          include: {
            workExperiences: {
              where: { deletedAt: null },
              orderBy: { startDate: "desc" }
            },
            educationExperiences: {
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
      profile: mapProfile(user.profile, user.badges)
    };
  },

  async upsertMyProfile(userId: string, input: UpdateMyProfileBody): Promise<MyProfileOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          where: { revokedAt: null },
          select: { badgeSlug: true },
          orderBy: { grantedAt: "asc" }
        }
      }
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
          currentCompany: input.currentCompany,
          about: input.about,
          locationCountry: input.locationCountry,
          locationCity: input.locationCity,
          locationPostalCode: input.locationPostalCode,
          profileImageUrl: input.profileImageUrl,
          profileBannerImageUrl: input.profileBannerImageUrl
        },
        update: buildProfileWriteData(input),
        include: {
          workExperiences: {
            where: { deletedAt: null },
            orderBy: { startDate: "desc" }
          },
          educationExperiences: {
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
              description: item.description,
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
            },
            educationExperiences: {
              where: { deletedAt: null },
              orderBy: { startDate: "desc" }
            }
          }
        });
      }

      if (input.educationHistory) {
        await tx.educationExperience.updateMany({
          where: {
            profileId: profile.id,
            deletedAt: null
          },
          data: { deletedAt: new Date() }
        });

        if (input.educationHistory.length > 0) {
          await tx.educationExperience.createMany({
            data: input.educationHistory.map((item) => ({
              profileId: profile.id,
              institution: item.institution,
              degree: item.degree,
              fieldOfStudy: item.fieldOfStudy,
              startDate: item.startYearMonth,
              endDate: item.endYearMonth,
              description: item.description
            }))
          });
        }

        return tx.profile.findUniqueOrThrow({
          where: { id: profile.id },
          include: {
            workExperiences: {
              where: { deletedAt: null },
              orderBy: { startDate: "desc" }
            },
            educationExperiences: {
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
      profile: mapProfile(updatedProfile, user.badges)
    };
  },

  async updateMyWorkExperiences(
    userId: string,
    input: UpdateMyWorkExperiencesBody
  ): Promise<MyProfileOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          where: { revokedAt: null },
          select: { badgeSlug: true },
          orderBy: { grantedAt: "asc" }
        },
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
          },
          educationExperiences: {
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
      profile: mapProfile(updatedProfile, user.badges)
    };
  },

  async updateMyEducationHistory(
    userId: string,
    input: UpdateMyEducationHistoryBody
  ): Promise<MyProfileOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          where: { revokedAt: null },
          select: { badgeSlug: true },
          orderBy: { grantedAt: "asc" }
        },
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
        await applyEducationOperation(tx, user.profile!.id, operation);
      }

      return tx.profile.findUniqueOrThrow({
        where: { id: user.profile!.id },
        include: {
          workExperiences: {
            where: { deletedAt: null },
            orderBy: { startDate: "desc" }
          },
          educationExperiences: {
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
      profile: mapProfile(updatedProfile, user.badges)
    };
  },

  async getMyPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        deletedAt: true,
        themePreference: true
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    return {
      themePreference: user.themePreference ?? "light"
    };
  },

  async updateMyPreferences(userId: string, input: { themePreference?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const updateData: Partial<{
      themePreference: string;
    }> = {};
    if (input.themePreference) {
      updateData.themePreference = input.themePreference;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        themePreference: true
      }
    });

    return {
      themePreference: updatedUser.themePreference ?? "light"
    };
  }
};
