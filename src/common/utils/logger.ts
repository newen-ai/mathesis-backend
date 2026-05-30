type Level = "info" | "warn" | "error";

const log = (level: Level, message: string, meta?: unknown): void => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta
  };

  const serialized = JSON.stringify(payload);
  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
};

export const logger = {
  info: (message: string, meta?: unknown): void => log("info", message, meta),
  warn: (message: string, meta?: unknown): void => log("warn", message, meta),
  error: (message: string, meta?: unknown): void => log("error", message, meta)
};
