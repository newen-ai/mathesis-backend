import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./common/utils/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`server_started`, {
    env: env.NODE_ENV,
    port: env.PORT
  });
});

const shutdown = (signal: string): void => {
  logger.warn("shutdown_signal_received", { signal });
  server.close(() => {
    logger.info("server_stopped");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
