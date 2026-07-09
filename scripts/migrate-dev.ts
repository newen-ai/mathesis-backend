import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

type RuntimeEnv = "local" | "dev" | "stage" | "prod";

const ALLOWED_ENVS: RuntimeEnv[] = ["local", "dev", "stage", "prod"];

const args = process.argv.slice(2);
const envArg = args[0];

if (!envArg) {
  console.error("Missing environment argument. Use one of: local, dev, stage, prod");
  process.exit(1);
}

if (!ALLOWED_ENVS.includes(envArg as RuntimeEnv)) {
  console.error(`Invalid environment: ${envArg}. Use one of: local, dev, stage, prod`);
  process.exit(1);
}

const selectedEnv = envArg as RuntimeEnv;
const envFile = `.env.${selectedEnv}`;
const envPath = path.resolve(process.cwd(), envFile);
const prismaArgs = args.slice(1);

if (!fs.existsSync(envPath)) {
  console.error(`Environment file not found: ${envFile}`);
  process.exit(1);
}

const dotenvResult = dotenv.config({ path: envPath, override: true });
if (dotenvResult.error) {
  console.error(`Failed to load environment file: ${envFile}`);
  console.error(dotenvResult.error.message);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error(`DATABASE_URL is missing after loading ${envFile}`);
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", "migrate", "dev", ...prismaArgs], {
  stdio: "inherit",
  env: process.env
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
