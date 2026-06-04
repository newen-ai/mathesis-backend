import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/app-error";
import { authService } from "../../modules/auth/auth.service";
import type { Role } from "../../modules/auth/auth.types";
import { env } from "../../config/env";

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

export const requireAuth = (...allowedRoles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    const tokenFromCookie = getTokenFromCookieHeader(req.headers.cookie, env.AUTH_COOKIE_NAME);
    const authorization = req.headers.authorization;
    const tokenFromBearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    const token = tokenFromCookie ?? tokenFromBearer;

    if (!token) {
      next(new AppError("Missing authentication token", StatusCodes.UNAUTHORIZED));
      return;
    }

    const payload = authService.verifyToken(token);

    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
      next(new AppError("Insufficient permissions", StatusCodes.FORBIDDEN));
      return;
    }

    req.user = payload;
    next();
  };
};
