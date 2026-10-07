-- Zero-downtime variant of prisma/migrations/27_optimize_website_event_indexes.
--
-- Prisma runs migrations inside a transaction, so it cannot use
-- CREATE INDEX CONCURRENTLY. On large website_event tables the transactional
-- build blocks event ingestion for the duration of the index build.
--
-- For production databases with significant traffic, run this script manually
-- (each statement autocommits; do NOT wrap in a transaction), then mark the
-- Prisma migration as applied:
--
--   psql "$DATABASE_URL" -f optimize-website-event-indexes-concurrently.sql
--   npx prisma migrate resolve --applied 27_optimize_website_event_indexes
--
-- If a CONCURRENTLY build is interrupted it leaves an INVALID index behind;
-- drop it and re-run (check with: \d website_event).

CREATE INDEX CONCURRENTLY IF NOT EXISTS "website_event_website_created_type_session_visit_idx"
    ON "website_event"("website_id", "created_at", "event_type", "session_id", "visit_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "website_event_website_created_path_type_session_idx"
    ON "website_event"("website_id", "created_at", "url_path", "event_type", "session_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "website_event_website_created_referrer_type_session_idx"
    ON "website_event"("website_id", "created_at", "referrer_domain", "event_type", "session_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "website_event_website_created_title_type_session_idx"
    ON "website_event"("website_id", "created_at", "page_title", "event_type", "session_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "website_event_website_created_event_type_session_idx"
    ON "website_event"("website_id", "created_at", "event_name", "event_type", "session_id");

DROP INDEX CONCURRENTLY IF EXISTS "website_event_website_id_created_at_url_path_idx";
DROP INDEX CONCURRENTLY IF EXISTS "website_event_website_id_created_at_referrer_domain_idx";
DROP INDEX CONCURRENTLY IF EXISTS "website_event_website_id_created_at_page_title_idx";
DROP INDEX CONCURRENTLY IF EXISTS "website_event_website_id_created_at_event_name_idx";

-- Index-only scans depend on the visibility map being current. website_event
-- is append-only, so a single vacuum after the build gets it there:
VACUUM (ANALYZE) "website_event";
