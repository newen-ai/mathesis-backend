-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "ChatMemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "type" "ChatType" NOT NULL,
    "title" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "direct_user_low_id" TEXT,
    "direct_user_high_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_members" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ChatMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "left_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "sender_user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_user_id" TEXT,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chats"
ADD CONSTRAINT "chats_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members"
ADD CONSTRAINT "chat_members_chat_id_fkey"
FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members"
ADD CONSTRAINT "chat_members_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_chat_id_fkey"
FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_sender_user_id_fkey"
FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_deleted_by_user_id_fkey"
FOREIGN KEY ("deleted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddUniqueConstraint
ALTER TABLE "chat_members"
ADD CONSTRAINT "chat_members_chat_id_user_id_key" UNIQUE ("chat_id", "user_id");

-- AddCheckConstraint
ALTER TABLE "chats"
ADD CONSTRAINT "chats_direct_pair_shape_check"
CHECK (
  (
    "type" = 'DIRECT'
    AND "direct_user_low_id" IS NOT NULL
    AND "direct_user_high_id" IS NOT NULL
    AND "direct_user_low_id" < "direct_user_high_id"
  )
  OR
  (
    "type" = 'GROUP'
    AND "direct_user_low_id" IS NULL
    AND "direct_user_high_id" IS NULL
  )
);

-- AddCheckConstraint
ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_content_non_empty_check"
CHECK (char_length(trim("content")) > 0);

-- CreateIndex
CREATE INDEX "chats_deleted_at_idx" ON "chats"("deleted_at");

-- CreateIndex
CREATE INDEX "chats_type_deleted_at_idx" ON "chats"("type", "deleted_at");

-- CreateIndex
CREATE INDEX "chats_created_by_user_id_deleted_at_idx" ON "chats"("created_by_user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "chats_direct_user_low_id_direct_user_high_id_deleted_at_idx"
ON "chats"("direct_user_low_id", "direct_user_high_id", "deleted_at");

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "chats_unique_active_direct_pair"
ON "chats"("direct_user_low_id", "direct_user_high_id")
WHERE "type" = 'DIRECT' AND "deleted_at" IS NULL;

-- CreateIndex
CREATE INDEX "chat_members_deleted_at_idx" ON "chat_members"("deleted_at");

-- CreateIndex
CREATE INDEX "chat_members_chat_id_left_at_deleted_at_idx" ON "chat_members"("chat_id", "left_at", "deleted_at");

-- CreateIndex
CREATE INDEX "chat_members_user_id_left_at_deleted_at_idx" ON "chat_members"("user_id", "left_at", "deleted_at");

-- CreateIndex
CREATE INDEX "chat_messages_deleted_at_idx" ON "chat_messages"("deleted_at");

-- CreateIndex
CREATE INDEX "chat_messages_chat_id_deleted_at_created_at_idx"
ON "chat_messages"("chat_id", "deleted_at", "created_at" DESC);

-- CreateIndex
CREATE INDEX "chat_messages_sender_user_id_deleted_at_idx" ON "chat_messages"("sender_user_id", "deleted_at");
