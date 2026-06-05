import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler } from "./common/middlewares/error-handler";
import { notFound } from "./common/middlewares/not-found";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
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
