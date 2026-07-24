ALTER TABLE "users"
ADD COLUMN "email_confirmation_token_hash" TEXT,
ADD COLUMN "email_confirmed_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "users_email_confirmation_token_hash_key"
ON "users"("email_confirmation_token_hash");
