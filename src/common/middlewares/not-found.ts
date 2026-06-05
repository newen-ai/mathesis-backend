import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const notFound: RequestHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "ROUTE_NOT_FOUND",
    details: {
      method: req.method,
      path: req.originalUrl
    }
  });
};
