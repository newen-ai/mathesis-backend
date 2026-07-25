import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/app-error";
import type { AuthPayload, Role, SessionOutput, User } from "./auth.types";
import type { LoginBody, RegisterBody } from "./auth.schemas";

const prisma = new PrismaClient();

function buildAccessToken(payload: AuthPayload): string {
  const expiresIn = env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn,
    algorithm: "HS256",
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
}

function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role
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

  async getSession(userId: string): Promise<SessionOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        deletedAt: true
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError("Session is invalid", StatusCodes.UNAUTHORIZED);
    }

    return {
      sessionActive: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role
      }
    };
  },

  verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET, {
        algorithms: ["HS256"],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE
      }) as AuthPayload;
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
