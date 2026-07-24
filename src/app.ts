import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { logger } from "./common/utils/logger";
import { apiRouter } from "./routes";
import { errorHandler } from "./common/middlewares/error-handler";
import { notFound } from "./common/middlewares/not-found";

const corsOptions = {
  origin(origin: string | undefined, callback: (error: Error | null, success?: boolean) => void) {
    const allowedOrigin = new URL(env.FRONTEND_BASE_URL).origin;

    if (!origin || origin === allowedOrigin) {
      callback(null, true);
      return;
    }

    logger.warn("cors_origin_rejected", {
      origin,
      allowedOrigin
    });
    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true
};

export const app = express();

app.use((req, _res, next) => {
  logger.info("request_incoming", {
    method: req.method,
    path: req.originalUrl,
    origin: req.headers.origin
  });
  next();
});

app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "BACKEND_SERVER_IS_RUNNING"
  });
});

app.use("/api/v1", apiRouter);

app.use(notFound);
app.use(errorHandler);
