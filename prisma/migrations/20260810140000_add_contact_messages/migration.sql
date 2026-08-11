-- CreateEnum
CREATE TYPE "ContactMessageCategory" AS ENUM ('GENERAL_INQUIRY', 'TECHNICAL_ISSUE', 'SUGGESTION', 'BUG_REPORT', 'OTHER');

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "ContactMessageCategory" NOT NULL,
    "details" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_messages_user_id_created_at_idx" ON "contact_messages"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "contact_messages_category_created_at_idx" ON "contact_messages"("category", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
