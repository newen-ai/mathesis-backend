import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import { AppError } from "../errors/app-error";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
  const message = isAppError ? err.message : "Internal server error";

  logger.error("request_failed", {
    statusCode,
    message: err.message,
    stack: env.NODE_ENV === "production" ? undefined : err.stack
  });

  res.status(statusCode).json({
    success: false,
    message,
    details: isAppError ? err.details : undefined,
    stack: env.NODE_ENV === "production" ? undefined : err.stack
  });
};
