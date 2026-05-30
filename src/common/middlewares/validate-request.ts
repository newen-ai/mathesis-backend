import { z } from "zod";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/app-error";

export const validateRequest = (schema: z.ZodTypeAny): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      next(
        new AppError("Validation failed", StatusCodes.BAD_REQUEST, true, parsed.error.issues)
      );
      return;
    }

    next();
  };
};
