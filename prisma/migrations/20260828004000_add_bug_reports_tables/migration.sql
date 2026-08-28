CREATE TABLE "bug_reports" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "page_url" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bug_report_attachments" (
  "id" TEXT NOT NULL,
  "bug_report_id" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "file_data" BYTEA NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bug_report_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bug_reports_user_id_created_at_idx"
ON "bug_reports"("user_id", "created_at" DESC);

CREATE INDEX "bug_reports_created_at_idx"
ON "bug_reports"("created_at" DESC);

CREATE INDEX "bug_report_attachments_bug_report_id_created_at_idx"
ON "bug_report_attachments"("bug_report_id", "created_at");

ALTER TABLE "bug_reports"
ADD CONSTRAINT "bug_reports_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bug_report_attachments"
ADD CONSTRAINT "bug_report_attachments_bug_report_id_fkey"
FOREIGN KEY ("bug_report_id") REFERENCES "bug_reports"("id")
ON DELETE CASCADE ON UPDATE CASCADE;