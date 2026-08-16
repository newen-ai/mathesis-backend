-- Create enterprise status enum
CREATE TYPE "EnterpriseStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- Create enterprises table
CREATE TABLE "enterprises" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "status" "EnterpriseStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id")
);

-- Add FK to users
ALTER TABLE "enterprises"
ADD CONSTRAINT "enterprises_owner_user_id_fkey"
FOREIGN KEY ("owner_user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "enterprises_deleted_at_idx" ON "enterprises"("deleted_at");
CREATE INDEX "enterprises_owner_user_id_deleted_at_created_at_idx" ON "enterprises"("owner_user_id", "deleted_at", "created_at" DESC);
CREATE INDEX "enterprises_status_deleted_at_idx" ON "enterprises"("status", "deleted_at");
