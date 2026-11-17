ALTER TABLE "session" ADD COLUMN "browser_version" VARCHAR(20);
ALTER TABLE "session" ADD COLUMN "os_version" VARCHAR(20);

CREATE INDEX "session_website_id_created_at_browser_version_idx"
  ON "session"("website_id", "created_at", "browser_version");
CREATE INDEX "session_website_id_created_at_os_version_idx"
  ON "session"("website_id", "created_at", "os_version");
