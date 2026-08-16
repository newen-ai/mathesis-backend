-- Drop enterprise status index
DROP INDEX IF EXISTS "enterprises_status_deleted_at_idx";

-- Drop enterprise status column
ALTER TABLE "enterprises"
DROP COLUMN IF EXISTS "status";

-- Drop enum type no longer used
DROP TYPE IF EXISTS "EnterpriseStatus";
