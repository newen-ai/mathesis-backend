-- Add mensaEmpresariosAdminAt to users
ALTER TABLE "users" ADD COLUMN "mensa_empresarios_admin_at" TIMESTAMP(3);

-- Create MensaBadgeRequestStatus enum
CREATE TYPE "MensaBadgeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create mensa_badge_requests table
CREATE TABLE "mensa_badge_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_slug" TEXT NOT NULL,
    "message" TEXT,
    "status" "MensaBadgeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensa_badge_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mensa_badge_requests_badge_slug_status_created_at_idx" ON "mensa_badge_requests"("badge_slug", "status", "created_at" DESC);
CREATE INDEX "mensa_badge_requests_user_id_badge_slug_idx" ON "mensa_badge_requests"("user_id", "badge_slug");

ALTER TABLE "mensa_badge_requests" ADD CONSTRAINT "mensa_badge_requests_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mensa_badge_requests" ADD CONSTRAINT "mensa_badge_requests_reviewed_by_user_id_fkey"
  FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
