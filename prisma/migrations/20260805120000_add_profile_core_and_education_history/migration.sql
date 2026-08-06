-- AlterTable
ALTER TABLE "profiles"
ADD COLUMN "about" TEXT,
ADD COLUMN "location_country" TEXT,
ADD COLUMN "location_city" TEXT,
ADD COLUMN "location_postal_code" TEXT;

-- CreateTable
CREATE TABLE "education_experiences" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field_of_study" TEXT,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "education_experiences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "education_experiences"
ADD CONSTRAINT "education_experiences_profile_id_fkey"
FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "education_experiences_deleted_at_idx" ON "education_experiences"("deleted_at");

-- CreateIndex
CREATE INDEX "education_experiences_profile_id_deleted_at_start_date_idx"
ON "education_experiences"("profile_id", "deleted_at", "start_date" DESC);
