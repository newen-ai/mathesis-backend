-- CreateTable
CREATE TABLE "ateneo_topic_attachments" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "file_data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ateneo_topic_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ateneo_topic_attachments_deleted_at_idx" ON "ateneo_topic_attachments"("deleted_at");

-- CreateIndex
CREATE INDEX "ateneo_topic_attachments_topic_id_deleted_at_idx" ON "ateneo_topic_attachments"("topic_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "ateneo_topic_attachments" ADD CONSTRAINT "ateneo_topic_attachments_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "ateneo_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;