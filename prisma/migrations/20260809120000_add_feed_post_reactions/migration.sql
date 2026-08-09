-- CreateEnum
CREATE TYPE "FeedPostReactionValue" AS ENUM ('value');

-- CreateTable
CREATE TABLE "feed_post_reactions" (
    "id" TEXT NOT NULL,
    "feed_post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reaction_value" "FeedPostReactionValue" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feed_post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feed_post_reactions_feed_post_id_user_id_key" ON "feed_post_reactions"("feed_post_id", "user_id");

-- CreateIndex
CREATE INDEX "feed_post_reactions_feed_post_id_idx" ON "feed_post_reactions"("feed_post_id");

-- CreateIndex
CREATE INDEX "feed_post_reactions_user_id_idx" ON "feed_post_reactions"("user_id");

-- AddForeignKey
ALTER TABLE "feed_post_reactions" ADD CONSTRAINT "feed_post_reactions_feed_post_id_fkey" FOREIGN KEY ("feed_post_id") REFERENCES "feed_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_post_reactions" ADD CONSTRAINT "feed_post_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;