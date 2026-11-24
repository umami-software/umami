-- Event-name-sliced index. Name-filtered queries (events activity table with
-- an event filter, event drill-downs) previously walked the created_at-ordered
-- indexes testing every row's name: fast for frequent names, pathological for
-- rare ones. With event_name as the second key column, such queries scan only
-- the matching slice in time order and terminate at the page/count limit.
--
-- NOTE for large databases: prefer the CONCURRENTLY script in
-- db/postgresql/data-migrations/add-event-name-index-concurrently.sql,
-- then: npx prisma migrate resolve --applied 28_add_event_name_index

-- CreateIndex
CREATE INDEX IF NOT EXISTS "website_event_website_event_name_created_idx"
    ON "website_event"("website_id", "event_name", "created_at");
