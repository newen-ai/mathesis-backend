import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { logger } from "../common/utils/logger";

const envBoolean = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean());

const envModeSchema = z.enum(["local", "dev", "test", "prod"]);
const rootEnvPath = path.resolve(process.cwd(), ".env");
if (!fs.existsSync(rootEnvPath)) {
  throw new Error("Missing .env file. It must define NODE_ENV.");
}

const rootEnvRaw = fs.readFileSync(rootEnvPath, "utf8");
const rootEnv = dotenv.parse(rootEnvRaw);
const nodeEnvParse = envModeSchema.safeParse(rootEnv.NODE_ENV);

if (!nodeEnvParse.success) {
  throw new Error("Invalid environment configuration: NODE_ENV must be set in .env and be one of local, dev, test, prod");
}

const nodeEnv = nodeEnvParse.data;
process.env.NODE_ENV = nodeEnv;

const envSpecificPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
if (!fs.existsSync(envSpecificPath)) {
  throw new Error(`Missing ${path.basename(envSpecificPath)} file.`);
}

dotenv.config({ path: envSpecificPath, override: true });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["local", "dev", "test", "prod"]).default("dev"),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_ACCESS_SECRET: z.string().min(10, "JWT_ACCESS_SECRET must be at least 10 chars"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_ISSUER: z.string().min(1).default("mathesis-backend"),
  JWT_AUDIENCE: z.string().min(1).default("mathesis-web"),
  FRONTEND_ORIGIN: z
    .string()
    .url()
    .transform((value) => new URL(value).origin)
    .default("http://localhost:3000"),
  FRONTEND_ORIGINS: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return [] as string[];
      }

      return value
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
        .map((origin) => new URL(origin).origin);
    }),
  AUTH_COOKIE_NAME: z.string().min(1).default("ml_access_token"),
  AUTH_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  AUTH_COOKIE_SECURE: envBoolean.default(false),
  WHITELIST_ENABLED: envBoolean.default(false),
  DEFAULT_ADMIN_EMAILS: z
    .string()
    .default("kenrouit@gmail.com")
    .transform((value) =>
      value
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0)
    ),
  TELEGRAM_REPORTING_ENABLED: envBoolean.default(false),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("no-reply@mail.mathesis.social"),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  PASSWORD_RESET_REQUESTS_PER_HOUR: z.coerce.number().int().positive().default(3)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

if (parsedEnv.data.AUTH_COOKIE_SAME_SITE === "none" && !parsedEnv.data.AUTH_COOKIE_SECURE) {
  throw new Error("Invalid environment configuration: AUTH_COOKIE_SECURE must be true when AUTH_COOKIE_SAME_SITE is none");
}

if (
  parsedEnv.data.TELEGRAM_REPORTING_ENABLED &&
  (!parsedEnv.data.TELEGRAM_BOT_TOKEN || !parsedEnv.data.TELEGRAM_CHAT_ID)
) {
  throw new Error("Invalid environment configuration: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required when TELEGRAM_REPORTING_ENABLED is true");
}

logger.info("env_loaded", {
  envFile: path.basename(envSpecificPath),
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  frontendOrigin: parsedEnv.data.FRONTEND_ORIGIN,
  frontendOrigins: parsedEnv.data.FRONTEND_ORIGINS,
  authCookieSameSite: parsedEnv.data.AUTH_COOKIE_SAME_SITE,
  authCookieSecure: parsedEnv.data.AUTH_COOKIE_SECURE,
  whitelistEnabled: parsedEnv.data.WHITELIST_ENABLED,
  defaultAdminEmails: parsedEnv.data.DEFAULT_ADMIN_EMAILS,
  telegramReportingEnabled: parsedEnv.data.TELEGRAM_REPORTING_ENABLED
});

const frontendAllowedOrigins = Array.from(
  new Set([parsedEnv.data.FRONTEND_ORIGIN, ...parsedEnv.data.FRONTEND_ORIGINS])
);

export const env = {
  ...parsedEnv.data,
  FRONTEND_ALLOWED_ORIGINS: frontendAllowedOrigins,
};
