-- Browser error tracking is opt-in for existing websites.
ALTER TABLE "website" ADD COLUMN "errors_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "error_retention_days" INTEGER NOT NULL DEFAULT 30;

CREATE TABLE "error_issue" (
  "issue_id" UUID NOT NULL PRIMARY KEY,
  "website_id" UUID NOT NULL,
  "fingerprint" VARCHAR(64) NOT NULL,
  "grouping_version" INTEGER NOT NULL DEFAULT 1,
  "title" VARCHAR(2200) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'unresolved',
  "resolved_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "error_issue_website_id_grouping_version_fingerprint_key"
  ON "error_issue"("website_id", "grouping_version", "fingerprint");
CREATE INDEX "error_issue_website_id_status_idx" ON "error_issue"("website_id", "status");

CREATE TABLE "error_event" (
  "website_id" UUID NOT NULL,
  "event_id" UUID NOT NULL,
  "issue_id" UUID NOT NULL,
  "session_id" UUID NOT NULL,
  "visit_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "name" VARCHAR(200) NOT NULL,
  "message" VARCHAR(2000) NOT NULL,
  "stack" TEXT NOT NULL,
  "frames" JSONB NOT NULL,
  "tags" JSONB NOT NULL,
  "handled" BOOLEAN NOT NULL,
  "url_path" VARCHAR(500) NOT NULL,
  "release" VARCHAR(100) NOT NULL,
  "environment" VARCHAR(50) NOT NULL,
  "browser" VARCHAR(50) NOT NULL,
  "os" VARCHAR(50) NOT NULL,
  "device" VARCHAR(50) NOT NULL,
  PRIMARY KEY ("website_id", "event_id")
);
CREATE INDEX "error_event_website_id_created_at_idx" ON "error_event"("website_id", "created_at");
CREATE INDEX "error_event_website_id_issue_id_created_at_idx" ON "error_event"("website_id", "issue_id", "created_at");
CREATE INDEX "error_event_website_id_received_at_idx" ON "error_event"("website_id", "received_at");

CREATE TABLE "error_rate_limit" (
  "website_id" UUID NOT NULL PRIMARY KEY,
  "bucket" TIMESTAMPTZ(6) NOT NULL,
  "count" INTEGER NOT NULL
);
