ALTER TABLE "website_event" ADD COLUMN "job_id" UUID AFTER "created_at";
ALTER TABLE "event_data" ADD COLUMN "job_id" UUID AFTER "created_at";