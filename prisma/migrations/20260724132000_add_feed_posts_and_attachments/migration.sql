-- CreateTable
CREATE TABLE "feed_posts" (
    "id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "feed_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_attachments" (
    "id" TEXT NOT NULL,
    "feed_post_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "file_data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "feed_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feed_posts_deleted_at_idx" ON "feed_posts"("deleted_at");

-- CreateIndex
CREATE INDEX "feed_posts_author_user_id_deleted_at_idx" ON "feed_posts"("author_user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "feed_posts_created_at_deleted_at_idx" ON "feed_posts"("created_at" DESC, "deleted_at");

-- CreateIndex
CREATE INDEX "feed_attachments_deleted_at_idx" ON "feed_attachments"("deleted_at");

-- CreateIndex
CREATE INDEX "feed_attachments_feed_post_id_deleted_at_idx" ON "feed_attachments"("feed_post_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_attachments" ADD CONSTRAINT "feed_attachments_feed_post_id_fkey" FOREIGN KEY ("feed_post_id") REFERENCES "feed_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;