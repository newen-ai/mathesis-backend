/*
  Warnings:

  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `currentCompany` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `currentJobTitle` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `work_experiences` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `first_name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_title` to the `work_experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `work_experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `work_experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `work_experiences` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "work_experiences" DROP CONSTRAINT "work_experiences_profileId_fkey";

-- DropIndex
DROP INDEX "profiles_deletedAt_idx";

-- DropIndex
DROP INDEX "profiles_userId_key";

-- DropIndex
DROP INDEX "users_deletedAt_idx";

-- DropIndex
DROP INDEX "work_experiences_deletedAt_idx";

-- DropIndex
DROP INDEX "work_experiences_profileId_deletedAt_startDate_idx";

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "createdAt",
DROP COLUMN "currentCompany",
DROP COLUMN "currentJobTitle",
DROP COLUMN "dateOfBirth",
DROP COLUMN "deletedAt",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_company" TEXT,
ADD COLUMN     "current_job_title" TEXT,
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "work_experiences" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "endDate",
DROP COLUMN "jobTitle",
DROP COLUMN "profileId",
DROP COLUMN "startDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "end_date" TEXT,
ADD COLUMN     "job_title" TEXT NOT NULL,
ADD COLUMN     "profile_id" TEXT NOT NULL,
ADD COLUMN     "start_date" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_deleted_at_idx" ON "profiles"("deleted_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "work_experiences_deleted_at_idx" ON "work_experiences"("deleted_at");

-- CreateIndex
CREATE INDEX "work_experiences_profile_id_deleted_at_start_date_idx" ON "work_experiences"("profile_id", "deleted_at", "start_date" DESC);

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
