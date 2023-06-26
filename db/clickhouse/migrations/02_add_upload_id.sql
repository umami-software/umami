ALTER TABLE "website_event" ADD COLUMN "upload_id" UUID AFTER "created_at";
ALTER TABLE "event_data" ADD COLUMN "upload_id" UUID AFTER "created_at";