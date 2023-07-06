-- edit event_data values
ALTER TABLE "event_data" RENAME COLUMN "event_date_value" TO "date_value";
ALTER TABLE "event_data" RENAME COLUMN "event_numeric_value" TO "number_value";
ALTER TABLE "event_data" RENAME COLUMN "event_string_value" TO "string_value";
ALTER TABLE "event_data" RENAME COLUMN "event_data_type" TO "data_type";

-- add job_id
ALTER TABLE "website_event" ADD COLUMN "job_id" UUID AFTER "created_at";
ALTER TABLE "event_data" ADD COLUMN "job_id" UUID AFTER "created_at";