ALTER TABLE "users"
ADD COLUMN "welcome_onboarding_completed_at" TIMESTAMP(3);

UPDATE "users"
SET "welcome_onboarding_completed_at" = NOW()
WHERE "welcome_onboarding_completed_at" IS NULL;

ALTER TABLE "profiles"
ADD COLUMN "middle_name" TEXT;