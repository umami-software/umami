-- =========================================================================
-- PostgreSQL pre-aggregation (rollup) tables for umami dashboards
-- =========================================================================
-- No extensions required. All counts are exact.
--
-- Distinct visitors/visits are computed exactly from the visit-grain tier;
-- if header latency ever matters more than exactness, mergeable HyperLogLog
-- columns (postgresql-hll) can be added later as a pure ALTER TABLE +
-- refresh-function increment (Phase 3).

-- -------------------------------------------------------------------------
-- Tier 1: event-name grain, hourly. Serves the events page.
-- Sizing at observed cardinality (71 event names): <= 71 x 24 = 1,704
-- rows/day regardless of event volume.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_event_rollup_hourly (
    website_id    UUID        NOT NULL,
    bucket        TIMESTAMPTZ NOT NULL,  -- date_trunc('hour', created_at) in UTC
    event_type    INTEGER     NOT NULL,  -- 1 = pageview, 2 = custom event
    event_name    VARCHAR(500) NOT NULL DEFAULT '',  -- '' for pageviews
    events        BIGINT      NOT NULL,  -- exact count(*)
    PRIMARY KEY (website_id, bucket, event_type, event_name)
);

-- -------------------------------------------------------------------------
-- Tier 2: visit grain, hourly. Serves the overview header (pageviews,
-- visitors, visits, bounces, total time), the time-series charts, and the
-- events-page visitor/visit counts with exact numbers, mirroring the grain
-- of umami's ClickHouse website_event_stats_hourly. Row count ~= active
-- (session, visit, hour) combinations: a 10-30x reduction from raw events.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_visit_rollup_hourly (
    website_id    UUID         NOT NULL,
    bucket        TIMESTAMPTZ  NOT NULL,
    session_id    UUID         NOT NULL,
    visit_id      UUID         NOT NULL,
    hostname      VARCHAR(100) NOT NULL DEFAULT '',  -- '' also stands for null
    views         BIGINT       NOT NULL,  -- pageviews (event_type = 1)
    event_views   BIGINT       NOT NULL,  -- custom events (event_type = 2)
    other_views   BIGINT       NOT NULL,  -- link/pixel events (types 3, 4)
    min_time      TIMESTAMPTZ,            -- over event_type NOT IN (2,5)
    max_time      TIMESTAMPTZ,            -- (stats-header duration semantics)
    all_min_time  TIMESTAMPTZ  NOT NULL,  -- over all non-performance events
    all_max_time  TIMESTAMPTZ  NOT NULL,  -- (sessions-list first/last semantics)
    -- session_id is part of the key: a visit_id can legitimately appear under
    -- more than one session_id (e.g. identify()/distinct_id re-keying a
    -- session mid-visit). hostname is part of the key because the sessions
    -- list groups by it. The grain must match the aggregation GROUP BY.
    PRIMARY KEY (website_id, bucket, visit_id, session_id, hostname)
);

CREATE INDEX IF NOT EXISTS website_visit_rollup_hourly_website_bucket_idx
    ON website_visit_rollup_hourly (website_id, bucket);

-- Watermark: everything strictly before processed_until is materialized.
CREATE TABLE IF NOT EXISTS rollup_watermark (
    name             TEXT PRIMARY KEY,
    processed_until  TIMESTAMPTZ NOT NULL
);
