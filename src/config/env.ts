import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

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
  JWT_ACCESS_TTL: z.string().default("15m")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsedEnv.data;
