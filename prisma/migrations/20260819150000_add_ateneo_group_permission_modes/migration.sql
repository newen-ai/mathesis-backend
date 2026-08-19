CREATE TYPE "AteneoPermissionMode" AS ENUM ('free', 'admins');

ALTER TABLE "ateneo_groups"
ADD COLUMN "create_topics_mode" "AteneoPermissionMode" NOT NULL DEFAULT 'free',
ADD COLUMN "comments_mode" "AteneoPermissionMode" NOT NULL DEFAULT 'free';
