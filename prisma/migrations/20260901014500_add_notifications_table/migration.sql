-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'POST_REACTION',
  'BADGE_APPROVED',
  'ENTERPRISE_APPROVED',
  'ACCOUNT_BANNED',
  'ACCOUNT_REMOVED',
  'ENTERPRISE_COFUNDER',
  'TERMS_UPDATED',
  'MEMBERSHIP_VERIFIED',
  'ENTERPRISE_REJECTED',
  'ACCOUNT_RESTORED'
);

-- CreateEnum
CREATE TYPE "NotificationLeadKind" AS ENUM ('INITIALS', 'SYMBOL');

-- CreateEnum
CREATE TYPE "NotificationLeadTone" AS ENUM ('NAVY', 'GOLD', 'GREEN', 'RED', 'GRAY', 'TEAL');

-- CreateTable
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "seed_key" TEXT,
  "lead_kind" "NotificationLeadKind" NOT NULL,
  "lead_value" TEXT NOT NULL,
  "lead_tone" "NotificationLeadTone" NOT NULL,
  "body_json" JSONB NOT NULL,
  "action_label" TEXT,
  "action_href" TEXT,
  "time_label_override" TEXT,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notifications_user_id_seed_key_key" ON "notifications"("user_id", "seed_key");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;