import { Router } from "express";
import { StatusCodes } from "http-status-codes";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

export { healthRouter };
