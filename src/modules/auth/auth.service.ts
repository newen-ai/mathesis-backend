import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/app-error";
import type { AuthPayload, ProfileWithWorkExperiences, Role, User } from "./auth.types";
import type { LoginBody, RegisterBody, UpdateMyProfileBody } from "./auth.schemas";

const prisma = new PrismaClient();

function buildAccessToken(payload: AuthPayload): string {
  const expiresIn = env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn });
}

function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}

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

function mapProfile(profile: ProfileWithWorkExperiences | null) {
  if (!profile) {
    return null;
  }

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth,
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

export const authService = {
  async register(input: RegisterBody): Promise<{ accessToken: string; user: object }> {
    const { email, password } = input;
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError("Email is already registered", StatusCodes.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "user"
      }
    });

    const payload: AuthPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role as Role
    };

    return {
      accessToken: buildAccessToken(payload),
      user: sanitizeUser(newUser as User)
    };
  },

  async login(input: LoginBody): Promise<{ accessToken: string; user: object }> {
    const { email, password } = input;
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role
    };

    return {
      accessToken: buildAccessToken(payload),
      user: sanitizeUser(user as User)
    };
  },

  async getMyProfile(userId: string): Promise<object> {
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
      ...sanitizeUser(user as User),
      profile: mapProfile(user.profile)
    };
  },

  async upsertMyProfile(userId: string, input: UpdateMyProfileBody): Promise<object> {
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
      ...sanitizeUser(user as User),
      profile: mapProfile(updatedProfile)
    };
  },

  verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    } catch {
      throw new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED);
    }
  }
};

// Cleanup on process termination
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
