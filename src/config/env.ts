import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { logger } from "../common/utils/logger";

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
  JWT_ISSUER: z.string().min(1).default("mensa-linkedin-backend"),
  JWT_AUDIENCE: z.string().min(1).default("mensa-linkedin-web"),
  FRONTEND_ORIGIN: z
    .string()
    .url()
    .transform((value) => new URL(value).origin)
    .default("http://localhost:3000"),
  AUTH_COOKIE_NAME: z.string().min(1).default("ml_access_token"),
  AUTH_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  AUTH_COOKIE_SECURE: z.coerce.boolean().default(false)
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

logger.info("env_loaded", {
  envFile: path.basename(envSpecificPath),
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  frontendOrigin: parsedEnv.data.FRONTEND_ORIGIN,
  authCookieSameSite: parsedEnv.data.AUTH_COOKIE_SAME_SITE,
  authCookieSecure: parsedEnv.data.AUTH_COOKIE_SECURE
});

export const env = parsedEnv.data;
