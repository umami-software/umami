-- AlterTable
ALTER TABLE "website_event" ADD COLUMN "session_id" UUID NULL;

UPDATE "website_event"
SET session_id = uuid_in(overlay(overlay(md5(CONCAT(session_id::text, to_char(date_trunc('hour', created_at), 'YYYY-MM-DD HH24:00:00'))) placing '4' from 13) placing '8' from 17)::cstring)
WHERE session_id IS NULL;

ALTER TABLE "website_event" ALTER COLUMN "session_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "website_event_visit_id_idx" ON "website_event"("visit_id");

-- CreateIndex
CREATE INDEX "website_event_website_id_visit_id_created_at_idx" ON "website_event"("website_id", "visit_id", "created_at");
