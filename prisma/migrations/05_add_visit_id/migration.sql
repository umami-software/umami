-- AlterTable
ALTER TABLE "website_event" ADD COLUMN "visit_id" UUID NULL;

UPDATE "website_event" we
SET visit_id = a.uuid
FROM (SELECT DISTINCT
        s.session_id,
        s.visit_time,
        gen_random_uuid() uuid
    FROM (SELECT DISTINCT session_id,
            date_trunc('hour', created_at) visit_time
        FROM "website_event") s) a
WHERE we.session_id = a.session_id 
    and date_trunc('hour', we.created_at) = a.visit_time;

ALTER TABLE "website_event" ALTER COLUMN "visit_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "website_event_visit_id_idx" ON "website_event"("visit_id");

-- CreateIndex
CREATE INDEX "website_event_website_id_visit_id_created_at_idx" ON "website_event"("website_id", "visit_id", "created_at");