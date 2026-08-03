-- Add canonical email to users so +aliases can map to one whitelist entry.
ALTER TABLE "users"
ADD COLUMN "canonical_email" TEXT;

UPDATE "users"
SET "canonical_email" =
  regexp_replace(split_part(lower(trim("email")), '@', 1), '\\+.*$', '')
  || '@' || split_part(lower(trim("email")), '@', 2)
WHERE "canonical_email" IS NULL;

ALTER TABLE "users"
ALTER COLUMN "canonical_email" SET NOT NULL;

CREATE INDEX "users_canonical_email_idx" ON "users"("canonical_email");

CREATE TABLE "whitelisted_emails" (
  "id" TEXT NOT NULL,
  "canonical_email" TEXT NOT NULL,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "whitelisted_emails_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whitelisted_emails_canonical_email_key" ON "whitelisted_emails"("canonical_email");
CREATE INDEX "whitelisted_emails_created_at_idx" ON "whitelisted_emails"("created_at" DESC);

ALTER TABLE "whitelisted_emails"
ADD CONSTRAINT "whitelisted_emails_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "WhitelistRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "whitelist_requests" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "canonical_email" TEXT NOT NULL,
  "message" TEXT,
  "status" "WhitelistRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewed_by_user_id" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "whitelist_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "whitelist_requests_status_created_at_idx" ON "whitelist_requests"("status", "created_at" DESC);
CREATE INDEX "whitelist_requests_canonical_email_status_idx" ON "whitelist_requests"("canonical_email", "status");
CREATE INDEX "whitelist_requests_user_id_created_at_idx" ON "whitelist_requests"("user_id", "created_at" DESC);

ALTER TABLE "whitelist_requests"
ADD CONSTRAINT "whitelist_requests_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "whitelist_requests"
ADD CONSTRAINT "whitelist_requests_reviewed_by_user_id_fkey"
FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "whitelist_audit" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "canonical_email" TEXT NOT NULL,
  "target_user_id" TEXT,
  "actor_user_id" TEXT,
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "whitelist_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "whitelist_audit_action_created_at_idx" ON "whitelist_audit"("action", "created_at" DESC);
CREATE INDEX "whitelist_audit_canonical_email_created_at_idx" ON "whitelist_audit"("canonical_email", "created_at" DESC);

ALTER TABLE "whitelist_audit"
ADD CONSTRAINT "whitelist_audit_target_user_id_fkey"
FOREIGN KEY ("target_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "whitelist_audit"
ADD CONSTRAINT "whitelist_audit_actor_user_id_fkey"
FOREIGN KEY ("actor_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
