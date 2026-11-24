-- Add a projection for replay lists, which filter by website and time. The table is sorted by
-- replay_id first, so without it every list reads the replays of all websites for the month.
-- The recorded events are left out so the projection stays small.
-- Note: not materialized here, so only new parts get it. To backfill existing replays, run:
--   ALTER TABLE umami.session_replay MATERIALIZE PROJECTION session_replay_website_projection;

-- Lightweight DELETE on this table now needs lightweight_mutation_projection_mode = 'rebuild',
-- or it is refused because of the projection. On ClickHouse 24.x it is a query setting only;
-- newer versions also take it as a table setting:
--   ALTER TABLE umami.session_replay MODIFY SETTING lightweight_mutation_projection_mode = 'rebuild';

ALTER TABLE umami.session_replay
ADD PROJECTION session_replay_website_projection (
    SELECT replay_id, website_id, session_id, visit_id, chunk_index, event_count, started_at, ended_at, created_at
    ORDER BY (website_id, created_at)
);
