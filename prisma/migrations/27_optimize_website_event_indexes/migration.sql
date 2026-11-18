-- Optimize website_event indexes for dashboard aggregation queries.
--
-- The core stats queries (getWebsiteStats, getPageviewStats, getSessionStats,
-- getActiveVisitors) and the metrics breakdowns (pages, referrers, titles,
-- events) filter on (website_id, created_at, event_type) and aggregate
-- session_id / visit_id. The previous indexes did not contain session_id,
-- visit_id, or event_type, so PostgreSQL had to fetch every heap tuple in the
-- date range (the heap row is wide: ~30 columns including many varchar(500)).
--
-- Adding the aggregated columns as trailing key columns enables index-only
-- scans: the entire query is answered from the index, which is several times
-- smaller than the heap and stays hot in shared_buffers.
--
-- NOTE for large existing databases: this migration builds indexes with
-- plain CREATE INDEX, which blocks writes to website_event while it runs.
-- If you cannot afford an ingest pause, pre-build the indexes with the
-- CONCURRENTLY script in db/postgresql/data-migrations/
-- optimize-website-event-indexes-concurrently.sql and then mark this
-- migration as applied with:
--   npx prisma migrate resolve --applied 27_optimize_website_event_indexes

-- CreateIndex
CREATE INDEX IF NOT EXISTS "website_event_website_created_type_session_visit_idx"
    ON "website_event"("website_id", "created_at", "event_type", "session_id", "visit_id");

-- CreateIndex (supersedes website_event_website_id_created_at_url_path_idx)
CREATE INDEX IF NOT EXISTS "website_event_website_created_path_type_session_idx"
    ON "website_event"("website_id", "created_at", "url_path", "event_type", "session_id");

-- CreateIndex (supersedes website_event_website_id_created_at_referrer_domain_idx)
CREATE INDEX IF NOT EXISTS "website_event_website_created_referrer_type_session_idx"
    ON "website_event"("website_id", "created_at", "referrer_domain", "event_type", "session_id", "hostname");

-- CreateIndex (supersedes website_event_website_id_created_at_page_title_idx)
CREATE INDEX IF NOT EXISTS "website_event_website_created_title_type_session_idx"
    ON "website_event"("website_id", "created_at", "page_title", "event_type", "session_id");

-- CreateIndex (supersedes website_event_website_id_created_at_event_name_idx)
CREATE INDEX IF NOT EXISTS "website_event_website_created_event_type_session_idx"
    ON "website_event"("website_id", "created_at", "event_name", "event_type", "session_id");

-- DropIndex: the four replaced indexes are strict prefixes of the new ones,
-- so every query shape they served is still served.
DROP INDEX IF EXISTS "website_event_website_id_created_at_url_path_idx";
DROP INDEX IF EXISTS "website_event_website_id_created_at_referrer_domain_idx";
DROP INDEX IF EXISTS "website_event_website_id_created_at_page_title_idx";
DROP INDEX IF EXISTS "website_event_website_id_created_at_event_name_idx";
