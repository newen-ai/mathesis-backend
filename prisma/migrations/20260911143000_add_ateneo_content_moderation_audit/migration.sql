-- CreateEnum
CREATE TYPE "AteneoModerationTargetType" AS ENUM ('MEMBER', 'TOPIC', 'COMMENT');

-- CreateEnum
CREATE TYPE "AteneoModerationAction" AS ENUM ('KICK', 'RESTORE_MEMBER', 'REMOVE_TOPIC', 'RESTORE_TOPIC', 'REMOVE_COMMENT', 'RESTORE_COMMENT');

-- CreateEnum
CREATE TYPE "AteneoModerationSource" AS ENUM ('MEMBERS_LIST', 'TOPIC', 'COMMENT', 'TOPIC_MENU', 'COMMENT_MENU', 'ADMIN_PANEL');

-- CreateTable
CREATE TABLE "ateneo_moderation_audits" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "target_type" "AteneoModerationTargetType" NOT NULL,
    "action" "AteneoModerationAction" NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "topic_id" TEXT,
    "comment_id" TEXT,
    "reason" TEXT,
    "source_context" "AteneoModerationSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ateneo_moderation_audits_pkey" PRIMARY KEY ("id")
);

-- Backfill member moderation history from the old expulsion audit stream.
INSERT INTO "ateneo_moderation_audits" (
  "id",
  "group_id",
  "target_type",
  "action",
  "actor_user_id",
  "target_user_id",
  "topic_id",
  "comment_id",
  "reason",
  "source_context",
  "created_at"
)
SELECT
  "id",
  "group_id",
  'MEMBER'::"AteneoModerationTargetType",
  CASE
    WHEN "action" = 'KICK' THEN 'KICK'::"AteneoModerationAction"
    WHEN "action" = 'RESTORE' THEN 'RESTORE_MEMBER'::"AteneoModerationAction"
  END,
  "actor_user_id",
  "target_user_id",
  "source_topic_id",
  "source_comment_id",
  "reason",
  "source_context"::text::"AteneoModerationSource",
  "created_at"
FROM "ateneo_group_expulsion_audits";

-- If a previous content moderation table exists, fold its rows in too.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = 'ateneo_content_moderation_audits'
  ) THEN
    INSERT INTO "ateneo_moderation_audits" (
      "id",
      "group_id",
      "target_type",
      "action",
      "actor_user_id",
      "target_user_id",
      "topic_id",
      "comment_id",
      "reason",
      "source_context",
      "created_at"
    )
    SELECT
      "id",
      "group_id",
      "target_type"::text::"AteneoModerationTargetType",
      CASE
        WHEN "target_type" = 'TOPIC' AND "action" = 'REMOVE' THEN 'REMOVE_TOPIC'::"AteneoModerationAction"
        WHEN "target_type" = 'TOPIC' AND "action" = 'RESTORE' THEN 'RESTORE_TOPIC'::"AteneoModerationAction"
        WHEN "target_type" = 'COMMENT' AND "action" = 'REMOVE' THEN 'REMOVE_COMMENT'::"AteneoModerationAction"
        WHEN "target_type" = 'COMMENT' AND "action" = 'RESTORE' THEN 'RESTORE_COMMENT'::"AteneoModerationAction"
      END,
      "actor_user_id",
      "target_author_user_id",
      "topic_id",
      "comment_id",
      "reason",
      "source_context"::text::"AteneoModerationSource",
      "created_at"
    FROM "ateneo_content_moderation_audits";
  END IF;
END $$;

-- CreateIndex
CREATE INDEX "ateneo_moderation_audits_group_id_created_at_idx" ON "ateneo_moderation_audits"("group_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_moderation_audits_target_type_action_created_at_idx" ON "ateneo_moderation_audits"("target_type", "action", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_moderation_audits_target_user_id_created_at_idx" ON "ateneo_moderation_audits"("target_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_moderation_audits_actor_user_id_created_at_idx" ON "ateneo_moderation_audits"("actor_user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "ateneo_moderation_audits" ADD CONSTRAINT "ateneo_moderation_audits_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ateneo_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_moderation_audits" ADD CONSTRAINT "ateneo_moderation_audits_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_moderation_audits" ADD CONSTRAINT "ateneo_moderation_audits_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_moderation_audits" ADD CONSTRAINT "ateneo_moderation_audits_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "ateneo_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_moderation_audits" ADD CONSTRAINT "ateneo_moderation_audits_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "ateneo_topic_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropTable
DROP TABLE IF EXISTS "ateneo_content_moderation_audits";

-- DropTable
DROP TABLE "ateneo_group_expulsion_audits";

-- DropEnum
DROP TYPE IF EXISTS "AteneoContentModerationTargetType";

-- DropEnum
DROP TYPE IF EXISTS "AteneoContentModerationAction";

-- DropEnum
DROP TYPE IF EXISTS "AteneoContentModerationSource";

-- DropEnum
DROP TYPE "AteneoGroupExpulsionAuditAction";
