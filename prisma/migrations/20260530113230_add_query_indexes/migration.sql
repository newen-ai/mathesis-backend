-- CreateIndex
CREATE INDEX "profiles_deletedAt_idx" ON "profiles"("deletedAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "work_experiences_deletedAt_idx" ON "work_experiences"("deletedAt");

-- CreateIndex
CREATE INDEX "work_experiences_profileId_deletedAt_startDate_idx" ON "work_experiences"("profileId", "deletedAt", "startDate" DESC);
