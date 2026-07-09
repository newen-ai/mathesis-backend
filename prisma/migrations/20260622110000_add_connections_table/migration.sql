-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "user_a_id" TEXT NOT NULL,
    "user_b_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "connections"
ADD CONSTRAINT "connections_user_a_id_fkey"
FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections"
ADD CONSTRAINT "connections_user_b_id_fkey"
FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "connections"
ADD CONSTRAINT "connections_users_different_check"
CHECK ("user_a_id" <> "user_b_id");

-- AddCheckConstraint
ALTER TABLE "connections"
ADD CONSTRAINT "connections_user_id_order_check"
CHECK ("user_a_id" < "user_b_id");

-- CreateIndex
CREATE INDEX "connections_deleted_at_idx" ON "connections"("deleted_at");

-- CreateIndex
CREATE INDEX "connections_user_a_id_deleted_at_idx" ON "connections"("user_a_id", "deleted_at");

-- CreateIndex
CREATE INDEX "connections_user_b_id_deleted_at_idx" ON "connections"("user_b_id", "deleted_at");

-- CreateIndex
CREATE INDEX "connections_user_a_id_user_b_id_deleted_at_idx" ON "connections"("user_a_id", "user_b_id", "deleted_at");

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "connections_unique_active_pair"
ON "connections"("user_a_id", "user_b_id")
WHERE "deleted_at" IS NULL;
