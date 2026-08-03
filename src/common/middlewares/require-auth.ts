import type { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/app-error";
import { authService } from "../../modules/auth/auth.service";
import { roles, type Role } from "../../modules/auth/auth.types";
import { env } from "../../config/env";

type RequireAuthOptions = {
  skipWhitelist?: boolean;
};

const prisma = new PrismaClient();

function getTokenFromCookieHeader(cookieHeader: string | undefined, cookieName: string): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(`${cookieName}=`)) {
      return decodeURIComponent(trimmedCookie.slice(cookieName.length + 1));
    }
  }

  return undefined;
}

export const requireAuth = (...args: Array<Role | RequireAuthOptions>): RequestHandler => {
  return (req, _res, next) => {
    const optionsArg = args.find((arg) => typeof arg === "object") as RequireAuthOptions | undefined;
    const allowedRoles = args.filter((arg): arg is Role => typeof arg === "string" && roles.includes(arg as Role));
    const tokenFromCookie = getTokenFromCookieHeader(req.headers.cookie, env.AUTH_COOKIE_NAME);
    const authorization = req.headers.authorization;
    const tokenFromBearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    const token = tokenFromCookie ?? tokenFromBearer;

    if (!token) {
      next(new AppError("Missing authentication token", StatusCodes.UNAUTHORIZED));
      return;
    }

    const payload = authService.verifyToken(token);
    void (async () => {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          canonicalEmail: true,
          deletedAt: true
        }
      });

      if (!user || user.deletedAt) {
        next(new AppError("Session is invalid", StatusCodes.UNAUTHORIZED));
        return;
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role as Role)) {
        next(new AppError("Insufficient permissions", StatusCodes.FORBIDDEN));
        return;
      }

      const whitelistRow = await prisma.whitelistedEmail.findUnique({
        where: { canonicalEmail: user.canonicalEmail },
        select: { id: true }
      });
      const isWhitelisted = Boolean(whitelistRow);

      req.user = {
        sub: user.id,
        email: user.email,
        role: user.role as Role,
        canonicalEmail: user.canonicalEmail,
        isWhitelisted
      };

      if (
        env.WHITELIST_ENABLED &&
        !optionsArg?.skipWhitelist &&
        req.user.role !== "admin" &&
        !req.user.isWhitelisted
      ) {
        next(
          new AppError("Account pending whitelist approval", StatusCodes.FORBIDDEN, true, {
            code: "USER_NOT_WHITELISTED",
            reason: "pending_whitelist_approval"
          })
        );
        return;
      }

      next();
    })().catch(next);
  };
};
