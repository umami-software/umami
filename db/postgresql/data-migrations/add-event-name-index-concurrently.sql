-- Zero-downtime variant of prisma/migrations/28_add_event_name_index.
-- Run manually (do NOT wrap in a transaction), then:
--   npx prisma migrate resolve --applied 28_add_event_name_index

\set ON_ERROR_STOP on

CREATE INDEX CONCURRENTLY IF NOT EXISTS "website_event_website_event_name_created_idx"
    ON "website_event"("website_id", "event_name", "created_at");

ANALYZE "website_event";
