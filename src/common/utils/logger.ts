type Level = "info" | "warn" | "error";

type LogMeta = {
  stack?: unknown;
} & Record<string, unknown>;

const getStackFromMeta = (meta: unknown): string | undefined => {
  if (!meta || typeof meta !== "object") {
    return undefined;
  }

  const candidate = (meta as LogMeta).stack;
  if (typeof candidate !== "string" || candidate.trim().length === 0) {
    return undefined;
  }

  return candidate;
};

const stripStackFromMeta = (meta: unknown): unknown => {
  if (!meta || typeof meta !== "object") {
    return meta;
  }

  const { stack: _stack, ...rest } = meta as LogMeta;
  return Object.keys(rest).length > 0 ? rest : undefined;
};

const log = (level: Level, message: string, meta?: unknown): void => {
  const stack = getStackFromMeta(meta);
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta: level === "error" ? stripStackFromMeta(meta) : meta
  };

  const serialized = JSON.stringify(payload);
  if (level === "error") {
    console.error(serialized);
    if (stack) {
      console.error(stack);
    }
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
