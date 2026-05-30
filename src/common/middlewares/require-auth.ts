import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/app-error";
import { authService } from "../../modules/auth/auth.service";
import type { Role } from "../../modules/auth/auth.types";

export const requireAuth = (...allowedRoles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header", authorization);
      next(new AppError("Missing or invalid authorization header", StatusCodes.UNAUTHORIZED));
      return;
    }

    const token = authorization.slice(7);
    const payload = authService.verifyToken(token);

    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
      next(new AppError("Insufficient permissions", StatusCodes.FORBIDDEN));
      return;
    }

    req.user = payload;
    next();
  };
};
