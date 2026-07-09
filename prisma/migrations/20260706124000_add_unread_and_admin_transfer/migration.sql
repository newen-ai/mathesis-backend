-- AlterTable
ALTER TABLE "chat_members"
ADD COLUMN "last_read_message_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "chat_members_chat_id_user_id_last_read_message_at_idx"
ON "chat_members"("chat_id", "user_id", "last_read_message_at");
