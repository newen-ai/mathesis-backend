/**
 * Backfill script: grants the "mensa_argentina" badge to all existing users who
 * should have it based on the current WHITELIST_ENABLED configuration.
 *
 * Usage:
 *   tsx scripts/backfill-mensa-argentina-badge.ts <env>
 *
 * Where <env> is one of: local, dev, stage, prod
 *
 * This script is idempotent — safe to re-run. Users who already have an active
 * badge will be skipped.
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const args = process.argv.slice(2);
const envArg = args[0];

const ALLOWED_ENVS = ["local", "dev", "stage", "prod"] as const;
type RuntimeEnv = (typeof ALLOWED_ENVS)[number];

if (!envArg || !ALLOWED_ENVS.includes(envArg as RuntimeEnv)) {
  console.error(`Usage: tsx scripts/backfill-mensa-argentina-badge.ts <${ALLOWED_ENVS.join("|")}>`);
  process.exit(1);
}

const envFile = `.env.${envArg as RuntimeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

if (!fs.existsSync(envPath)) {
  console.error(`Environment file not found: ${envFile}`);
  process.exit(1);
}

dotenv.config({ path: envPath, override: true });

if (!process.env.DATABASE_URL) {
  console.error(`DATABASE_URL is not set in ${envFile}`);
  process.exit(1);
}

// Imports after env is loaded so Prisma picks up DATABASE_URL
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { env } = require("../src/config/env") as typeof import("../src/config/env");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { BADGE_SLUGS } = require("../src/modules/badge/badge.service") as typeof import("../src/modules/badge/badge.service");

const prisma = new PrismaClient();

const BADGE_SLUG = BADGE_SLUGS.MENSA_ARGENTINA;

async function main() {
  console.log(`[backfill] WHITELIST_ENABLED = ${env.WHITELIST_ENABLED}`);

  let userIds: string[];

  if (env.WHITELIST_ENABLED) {
    // Only users whose canonical email is in the whitelist
    const whitelistedEmails = await prisma.whitelistedEmail.findMany({
      select: { canonicalEmail: true }
    });

    const canonicalEmails = whitelistedEmails.map((r) => r.canonicalEmail);

    if (canonicalEmails.length === 0) {
      console.log("[backfill] Whitelist is enabled but empty — no users to backfill.");
      return;
    }

    const users = await prisma.user.findMany({
      where: { deletedAt: null, canonicalEmail: { in: canonicalEmails } },
      select: { id: true }
    });

    userIds = users.map((u) => u.id);
    console.log(`[backfill] ${userIds.length} whitelisted user(s) found.`);
  } else {
    // All non-deleted users
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true }
    });

    userIds = users.map((u) => u.id);
    console.log(`[backfill] ${userIds.length} total user(s) found (whitelist disabled).`);
  }

  let granted = 0;
  let skipped = 0;

  for (const userId of userIds) {
    const existing = await prisma.userBadge.findFirst({
      where: { userId, badgeSlug: BADGE_SLUG, revokedAt: null },
      select: { id: true }
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.userBadge.create({ data: { userId, badgeSlug: BADGE_SLUG } });
    granted++;
  }

  console.log(`[backfill] Done. Granted: ${granted}, Skipped (already had badge): ${skipped}`);
}

main()
  .catch((err) => {
    console.error("[backfill] Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
