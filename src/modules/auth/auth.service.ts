import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import { telegramNotifier } from "../../common/services/telegram-notifier";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../common/services/email.service";
import { maskEmailAddress, normalizeEmailAddress, toCanonicalEmail } from "../../common/utils/email";
import type { AuthPayload, Role, SessionOutput, User } from "./auth.types";
import type {
  ChangePasswordBody,
  ConfirmPasswordResetBody,
  LoginBody,
  RegisterBody,
  RequestPasswordResetBody
} from "./auth.schemas";
import { whitelistService } from "../whitelist/whitelist.service";
import { badgeService, BADGE_SLUGS } from "../badge/badge.service";

function buildAccessToken(payload: AuthPayload): string {
  const expiresIn = env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn,
    algorithm: "HS256",
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
}

function buildAuthPayload(input: {
  id: string;
  email: string;
  role: string;
  authSessionVersion: number;
}): AuthPayload {
  return {
    sub: input.id,
    email: input.email,
    role: input.role as Role,
    authSessionVersion: input.authSessionVersion
  };
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

function generateEmailVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

const passwordResetRateLimitStore = new Map<string, number[]>();

function isPasswordResetRateLimited(canonicalEmail: string, now: number): boolean {
  const oneHourAgo = now - 60 * 60 * 1000;
  const history = passwordResetRateLimitStore.get(canonicalEmail) ?? [];
  const recentHistory = history.filter((timestamp) => timestamp >= oneHourAgo);

  if (recentHistory.length >= env.PASSWORD_RESET_REQUESTS_PER_HOUR) {
    passwordResetRateLimitStore.set(canonicalEmail, recentHistory);
    return true;
  }

  recentHistory.push(now);
  passwordResetRateLimitStore.set(canonicalEmail, recentHistory);
  return false;
}

export const authService = {
  async register(input: RegisterBody): Promise<{ accessToken: string; user: object }> {
    const email = normalizeEmailAddress(input.email);
    const canonicalEmail = toCanonicalEmail(email);
    const { firstName, middleName, lastName, password } = input;
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError("Email is already registered", StatusCodes.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailVerificationToken = generateEmailVerificationToken();
    const newUser = await prisma.user.create({
      data: {
        email,
        canonicalEmail,
        passwordHash,
        role: resolveInitialRole(email),
        emailVerificationToken,
        profile: {
          create: {
            firstName,
            middleName,
            lastName
          }
        }
      }
    });

    const isWhitelisted = await whitelistService.isCanonicalEmailWhitelisted(canonicalEmail);
    const effectiveWhitelistState = resolveEffectiveWhitelistState(isWhitelisted);

    if (effectiveWhitelistState) {
      await badgeService.grantBadge(newUser.id, BADGE_SLUGS.MENSA_ARGENTINA);
    }

    const payload = buildAuthPayload({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      authSessionVersion: newUser.authSessionVersion
    });

    await telegramNotifier.notifyRegistration({
      userId: newUser.id,
      maskedEmail: maskEmailAddress(newUser.email),
      isWhitelisted
    });

    const verificationUrl = new URL("/confirm", env.FRONTEND_ORIGIN);
    verificationUrl.searchParams.set("token", emailVerificationToken);

    await sendVerificationEmail({
      email: newUser.email,
      verificationUrl: verificationUrl.toString()
    });

    return {
      accessToken: buildAccessToken(payload),
      user: {
        ...sanitizeUser(newUser as User),
        isWhitelisted: effectiveWhitelistState
      }
    };
  },

  async confirmEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (!token.trim()) {
      throw new AppError("Verification token is required", StatusCodes.BAD_REQUEST);
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      throw new AppError("Invalid or expired confirmation token", StatusCodes.BAD_REQUEST);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null
      }
    });

    return {
      success: true,
      message: "EMAIL_VERIFIED"
    };
  },

  async requestPasswordReset(input: RequestPasswordResetBody): Promise<{ success: boolean; message: string }> {
    const email = normalizeEmailAddress(input.email);
    const canonicalEmail = toCanonicalEmail(email);
    const now = Date.now();

    if (isPasswordResetRateLimited(canonicalEmail, now)) {
      return {
        success: true,
        message: "PASSWORD_RESET_EMAIL_SENT"
      };
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.deletedAt) {
      return {
        success: true,
        message: "PASSWORD_RESET_EMAIL_SENT"
      };
    }

    const token = generatePasswordResetToken();
    const expiresAt = new Date(now + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiresAt: expiresAt
      }
    });

    const resetUrl = new URL("/reset-password", env.FRONTEND_ORIGIN);
    resetUrl.searchParams.set("token", token);

    await sendPasswordResetEmail({
      email: user.email,
      resetUrl: resetUrl.toString(),
      expiresInMinutes: env.PASSWORD_RESET_TTL_MINUTES
    });

    return {
      success: true,
      message: "PASSWORD_RESET_EMAIL_SENT"
    };
  },

  async confirmPasswordReset(input: ConfirmPasswordResetBody): Promise<{ success: boolean; message: string }> {
    const token = input.token.trim();

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        deletedAt: null
      }
    });

    if (!user || !user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
      throw new AppError("Invalid or expired reset token", StatusCodes.BAD_REQUEST);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        authSessionVersion: {
          increment: 1
        },
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null
      }
    });

    return {
      success: true,
      message: "PASSWORD_RESET_SUCCESSFUL"
    };
  },

  async changePassword(userId: string, input: ChangePasswordBody): Promise<{ success: boolean; message: string; accessToken: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.deletedAt) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", StatusCodes.UNAUTHORIZED);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        authSessionVersion: {
          increment: 1
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        authSessionVersion: true
      }
    });

    const accessToken = buildAccessToken(buildAuthPayload(updatedUser));

    return {
      success: true,
      message: "PASSWORD_CHANGED",
      accessToken
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

    if (!user.emailVerifiedAt) {
      throw new AppError("Email address is not verified", StatusCodes.FORBIDDEN, true, {
        code: "EMAIL_NOT_VERIFIED",
        reason: "email_not_verified"
      });
    }

    const isWhitelisted = await whitelistService.isCanonicalEmailWhitelisted(user.canonicalEmail);
    const effectiveWhitelistState = resolveEffectiveWhitelistState(isWhitelisted);
    if (env.WHITELIST_ENABLED && user.role !== "admin" && !effectiveWhitelistState) {
      throw new AppError("Account pending whitelist approval", StatusCodes.FORBIDDEN, true, {
        code: "USER_NOT_WHITELISTED",
        reason: "pending_whitelist_approval"
      });
    }

    const payload = buildAuthPayload({
      id: user.id,
      email: user.email,
      role: user.role,
      authSessionVersion: user.authSessionVersion
    });

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
        emailVerifiedAt: true,
        welcomeOnboardingCompletedAt: true,
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
        isWhitelisted: effectiveWhitelistState,
        hasVerifiedEmail: Boolean(user.emailVerifiedAt),
        hasCompletedWelcomeOnboarding: Boolean(user.welcomeOnboardingCompletedAt)
      }
    };
  },

  async completeWelcomeOnboarding(userId: string): Promise<{ completed: true }> {
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

    await prisma.user.update({
      where: { id: userId },
      data: {
        welcomeOnboardingCompletedAt: new Date()
      }
    });

    return { completed: true };
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
