import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/app-error";
import { telegramNotifier } from "../../common/services/telegram-notifier";
import { maskEmailAddress, normalizeEmailAddress, toCanonicalEmail } from "../../common/utils/email";
import type { AuthPayload, Role, SessionOutput, User } from "./auth.types";
import type { LoginBody, RegisterBody } from "./auth.schemas";
import { whitelistService } from "../whitelist/whitelist.service";

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

function resolveInitialRole(email: string): Role {
  return env.DEFAULT_ADMIN_EMAILS.includes(email) ? "admin" : "user";
}

function resolveEffectiveWhitelistState(isWhitelisted: boolean): boolean {
  return env.WHITELIST_ENABLED ? isWhitelisted : true;
}

export const authService = {
  async register(input: RegisterBody): Promise<{ accessToken: string; user: object }> {
    const email = normalizeEmailAddress(input.email);
    const canonicalEmail = toCanonicalEmail(email);
    const { password } = input;
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
        canonicalEmail,
        passwordHash,
        role: resolveInitialRole(email)
      }
    });

    const isWhitelisted = await whitelistService.isCanonicalEmailWhitelisted(canonicalEmail);
    const effectiveWhitelistState = resolveEffectiveWhitelistState(isWhitelisted);

    const payload: AuthPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role as Role
    };

    await telegramNotifier.notifyRegistration({
      userId: newUser.id,
      maskedEmail: maskEmailAddress(newUser.email),
      isWhitelisted
    });

    return {
      accessToken: buildAccessToken(payload),
      user: {
        ...sanitizeUser(newUser as User),
        isWhitelisted: effectiveWhitelistState
      }
    };
  },

  async login(input: LoginBody): Promise<{ accessToken: string; user: object }> {
    const email = normalizeEmailAddress(input.email);
    const { password } = input;
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.deletedAt) {
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

    const isWhitelisted = await whitelistService.isCanonicalEmailWhitelisted(user.canonicalEmail);
    const effectiveWhitelistState = resolveEffectiveWhitelistState(isWhitelisted);

    return {
      accessToken: buildAccessToken(payload),
      user: {
        ...sanitizeUser(user as User),
        isWhitelisted: effectiveWhitelistState
      }
    };
  },

  async getSession(userId: string): Promise<SessionOutput> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        canonicalEmail: true,
        deletedAt: true
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError("Session is invalid", StatusCodes.UNAUTHORIZED);
    }

    const isWhitelisted = await whitelistService.isCanonicalEmailWhitelisted(user.canonicalEmail);
    const effectiveWhitelistState = resolveEffectiveWhitelistState(isWhitelisted);

    return {
      sessionActive: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        isWhitelisted: effectiveWhitelistState
      }
    };
  },

  async createWhitelistRequest(userId: string, message?: string): Promise<{ requestId: string; status: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        canonicalEmail: true,
        deletedAt: true
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const isWhitelisted = await whitelistService.isCanonicalEmailWhitelisted(user.canonicalEmail);
    if (isWhitelisted) {
      throw new AppError("User is already whitelisted", StatusCodes.CONFLICT, true, {
        code: "USER_ALREADY_WHITELISTED"
      });
    }

    const request = await whitelistService.createWhitelistRequest(user.id, user.canonicalEmail, message);

    return {
      requestId: request.requestId,
      status: request.status
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
