import { z } from "zod";
import type { Request, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/app-error";

type ParsedRequestData = {
  body: Request["body"];
  query: Request["query"];
  params: Request["params"];
};

function syncObjectValues(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): void {
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, source);
}

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

    const parsedData = parsed.data as ParsedRequestData;

    req.body = parsedData.body;
    syncObjectValues(req.query as Record<string, unknown>, parsedData.query as Record<string, unknown>);
    syncObjectValues(req.params as Record<string, unknown>, parsedData.params as Record<string, unknown>);

    next();
  };
};
