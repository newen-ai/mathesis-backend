-- CreateEnum
CREATE TYPE "UserBlockAuditAction" AS ENUM ('BLOCK', 'UNBLOCK');

-- CreateTable
CREATE TABLE "user_blocks" (
    "id" TEXT NOT NULL,
    "blocker_user_id" TEXT NOT NULL,
    "blocked_user_id" TEXT NOT NULL,
    "reason_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lifted_at" TIMESTAMP(3),

    CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_block_audit" (
    "id" TEXT NOT NULL,
    "action" "UserBlockAuditAction" NOT NULL,
    "actor_user_id" TEXT,
    "target_user_id" TEXT,
    "reason_note" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_block_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_blocks_blocker_user_id_blocked_user_id_key" ON "user_blocks"("blocker_user_id", "blocked_user_id");

-- CreateIndex
CREATE INDEX "user_blocks_blocker_user_id_lifted_at_idx" ON "user_blocks"("blocker_user_id", "lifted_at");

-- CreateIndex
CREATE INDEX "user_blocks_blocked_user_id_lifted_at_idx" ON "user_blocks"("blocked_user_id", "lifted_at");

-- CreateIndex
CREATE INDEX "user_blocks_blocker_user_id_blocked_user_id_lifted_at_idx" ON "user_blocks"("blocker_user_id", "blocked_user_id", "lifted_at");

-- CreateIndex
CREATE INDEX "user_block_audit_action_occurred_at_idx" ON "user_block_audit"("action", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "user_block_audit_actor_user_id_occurred_at_idx" ON "user_block_audit"("actor_user_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "user_block_audit_target_user_id_occurred_at_idx" ON "user_block_audit"("target_user_id", "occurred_at" DESC);

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_user_id_fkey" FOREIGN KEY ("blocker_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_user_id_fkey" FOREIGN KEY ("blocked_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_block_audit" ADD CONSTRAINT "user_block_audit_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_block_audit" ADD CONSTRAINT "user_block_audit_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
