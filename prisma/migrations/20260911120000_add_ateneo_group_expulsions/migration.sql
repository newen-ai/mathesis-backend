-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MEMBER_KICKED';

-- CreateEnum
CREATE TYPE "AteneoGroupExpulsionSource" AS ENUM ('MEMBERS_LIST', 'TOPIC', 'COMMENT', 'ADMIN_PANEL');

-- CreateEnum
CREATE TYPE "AteneoGroupExpulsionAuditAction" AS ENUM ('KICK', 'RESTORE');

-- CreateTable
CREATE TABLE "ateneo_group_expulsions" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kicked_by_user_id" TEXT NOT NULL,
    "lifted_by_user_id" TEXT,
    "reason" TEXT,
    "source_context" "AteneoGroupExpulsionSource" NOT NULL,
    "source_topic_id" TEXT,
    "source_comment_id" TEXT,
    "target_was_admin" BOOLEAN NOT NULL DEFAULT false,
    "kicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lifted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ateneo_group_expulsions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ateneo_group_expulsion_audits" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "action" "AteneoGroupExpulsionAuditAction" NOT NULL,
    "reason" TEXT,
    "source_context" "AteneoGroupExpulsionSource" NOT NULL,
    "source_topic_id" TEXT,
    "source_comment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ateneo_group_expulsion_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ateneo_group_expulsions_group_id_user_id_key" ON "ateneo_group_expulsions"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "ateneo_group_expulsions_group_id_lifted_at_kicked_at_idx" ON "ateneo_group_expulsions"("group_id", "lifted_at", "kicked_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_group_expulsions_user_id_lifted_at_idx" ON "ateneo_group_expulsions"("user_id", "lifted_at");

-- CreateIndex
CREATE INDEX "ateneo_group_expulsions_kicked_by_user_id_kicked_at_idx" ON "ateneo_group_expulsions"("kicked_by_user_id", "kicked_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_group_expulsion_audits_group_id_created_at_idx" ON "ateneo_group_expulsion_audits"("group_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_group_expulsion_audits_target_user_id_created_at_idx" ON "ateneo_group_expulsion_audits"("target_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_group_expulsion_audits_actor_user_id_created_at_idx" ON "ateneo_group_expulsion_audits"("actor_user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "ateneo_group_expulsions" ADD CONSTRAINT "ateneo_group_expulsions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ateneo_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_expulsions" ADD CONSTRAINT "ateneo_group_expulsions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_expulsions" ADD CONSTRAINT "ateneo_group_expulsions_kicked_by_user_id_fkey" FOREIGN KEY ("kicked_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_expulsions" ADD CONSTRAINT "ateneo_group_expulsions_lifted_by_user_id_fkey" FOREIGN KEY ("lifted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_expulsion_audits" ADD CONSTRAINT "ateneo_group_expulsion_audits_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ateneo_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_expulsion_audits" ADD CONSTRAINT "ateneo_group_expulsion_audits_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_expulsion_audits" ADD CONSTRAINT "ateneo_group_expulsion_audits_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
