-- CreateEnum
CREATE TYPE "AteneoTopicTone" AS ENUM ('LIBRE', 'SERIO', 'RECOMENDADO');

-- CreateEnum
CREATE TYPE "AteneoReactionValue" AS ENUM ('value');

-- CreateTable
CREATE TABLE "ateneo_groups" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "member_subtitle" TEXT NOT NULL DEFAULT '0 miembros',
    "activity_label" TEXT NOT NULL DEFAULT 'Sin actividad',
    "icon" TEXT NOT NULL DEFAULT 'community',
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ateneo_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ateneo_group_rules" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ateneo_group_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ateneo_group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "left_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ateneo_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ateneo_topics" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tone" "AteneoTopicTone" NOT NULL DEFAULT 'LIBRE',
    "reaction_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ateneo_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ateneo_topic_comments" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_comment_id" TEXT,
    "mention_user_id" TEXT,
    "reaction_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ateneo_topic_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ateneo_topic_reactions" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reaction_value" "AteneoReactionValue" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ateneo_topic_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ateneo_topic_comment_reactions" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reaction_value" "AteneoReactionValue" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ateneo_topic_comment_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ateneo_groups_slug_key" ON "ateneo_groups"("slug");

-- CreateIndex
CREATE INDEX "ateneo_groups_deleted_at_idx" ON "ateneo_groups"("deleted_at");

-- CreateIndex
CREATE INDEX "ateneo_groups_created_by_user_id_deleted_at_idx" ON "ateneo_groups"("created_by_user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "ateneo_group_rules_group_id_deleted_at_position_idx" ON "ateneo_group_rules"("group_id", "deleted_at", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ateneo_group_members_group_id_user_id_key" ON "ateneo_group_members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "ateneo_group_members_group_id_deleted_at_left_at_idx" ON "ateneo_group_members"("group_id", "deleted_at", "left_at");

-- CreateIndex
CREATE INDEX "ateneo_group_members_user_id_deleted_at_left_at_idx" ON "ateneo_group_members"("user_id", "deleted_at", "left_at");

-- CreateIndex
CREATE INDEX "ateneo_group_members_is_pinned_user_id_deleted_at_idx" ON "ateneo_group_members"("is_pinned", "user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "ateneo_topics_group_id_deleted_at_created_at_idx" ON "ateneo_topics"("group_id", "deleted_at", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_topics_author_user_id_deleted_at_idx" ON "ateneo_topics"("author_user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "ateneo_topics_is_recommended_deleted_at_created_at_idx" ON "ateneo_topics"("is_recommended", "deleted_at", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ateneo_topic_comments_topic_id_deleted_at_created_at_idx" ON "ateneo_topic_comments"("topic_id", "deleted_at", "created_at" ASC);

-- CreateIndex
CREATE INDEX "ateneo_topic_comments_author_user_id_deleted_at_idx" ON "ateneo_topic_comments"("author_user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "ateneo_topic_comments_parent_comment_id_deleted_at_idx" ON "ateneo_topic_comments"("parent_comment_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ateneo_topic_reactions_topic_id_user_id_key" ON "ateneo_topic_reactions"("topic_id", "user_id");

-- CreateIndex
CREATE INDEX "ateneo_topic_reactions_topic_id_idx" ON "ateneo_topic_reactions"("topic_id");

-- CreateIndex
CREATE INDEX "ateneo_topic_reactions_user_id_idx" ON "ateneo_topic_reactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ateneo_topic_comment_reactions_comment_id_user_id_key" ON "ateneo_topic_comment_reactions"("comment_id", "user_id");

-- CreateIndex
CREATE INDEX "ateneo_topic_comment_reactions_comment_id_idx" ON "ateneo_topic_comment_reactions"("comment_id");

-- CreateIndex
CREATE INDEX "ateneo_topic_comment_reactions_user_id_idx" ON "ateneo_topic_comment_reactions"("user_id");

-- AddForeignKey
ALTER TABLE "ateneo_groups" ADD CONSTRAINT "ateneo_groups_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_rules" ADD CONSTRAINT "ateneo_group_rules_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ateneo_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_members" ADD CONSTRAINT "ateneo_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ateneo_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_group_members" ADD CONSTRAINT "ateneo_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topics" ADD CONSTRAINT "ateneo_topics_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ateneo_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topics" ADD CONSTRAINT "ateneo_topics_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topic_comments" ADD CONSTRAINT "ateneo_topic_comments_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "ateneo_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topic_comments" ADD CONSTRAINT "ateneo_topic_comments_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topic_comments" ADD CONSTRAINT "ateneo_topic_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "ateneo_topic_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topic_comments" ADD CONSTRAINT "ateneo_topic_comments_mention_user_id_fkey" FOREIGN KEY ("mention_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topic_reactions" ADD CONSTRAINT "ateneo_topic_reactions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "ateneo_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topic_reactions" ADD CONSTRAINT "ateneo_topic_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topic_comment_reactions" ADD CONSTRAINT "ateneo_topic_comment_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "ateneo_topic_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ateneo_topic_comment_reactions" ADD CONSTRAINT "ateneo_topic_comment_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
