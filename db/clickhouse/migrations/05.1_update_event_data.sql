ALTER TABLE "event_data_blob" ADD COLUMN "event_name" Nullable(String);
ALTER TABLE "event_data" ADD COLUMN "visit_id" Nullable(UUID);