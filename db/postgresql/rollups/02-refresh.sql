-- =========================================================================
-- Idempotent incremental refresh. Safe to run at any frequency; each call
-- materializes fully-elapsed hours between the watermark and now() - grace,
-- in bounded batches (delete + insert per hour range, single transaction
-- per call). Re-running over the same hours produces identical results.
-- =========================================================================
CREATE OR REPLACE FUNCTION refresh_website_rollups(
    grace     INTERVAL DEFAULT '10 minutes',
    max_hours INTEGER  DEFAULT 30,
    -- Hours inside this window are re-aggregated on every run even though the
    -- watermark has passed them, so events submitted with backdated timestamps
    -- (the /api/send payload accepts one) are picked up. Events backdated
    -- further than the lookback are NOT reflected in rollups until the
    -- watermark is manually rewound. max_hours defaults above the lookback so
    -- a steady-state run always reaches the present.
    lookback  INTERVAL DEFAULT '24 hours'
) RETURNS TABLE (from_hour TIMESTAMPTZ, to_hour TIMESTAMPTZ, event_rows BIGINT, visit_rows BIGINT)
LANGUAGE plpgsql AS $$
DECLARE
    v_from TIMESTAMPTZ;
    v_to   TIMESTAMPTZ;
    v_event_rows BIGINT := 0;
    v_visit_rows BIGINT := 0;
BEGIN
    -- All bucket and boundary arithmetic is in UTC regardless of the
    -- connection's ambient TimeZone setting (date_trunc on timestamptz
    -- truncates in the session timezone). Transaction-local.
    PERFORM set_config('TimeZone', 'UTC', true);

    -- Replica guard: skip silently on hot standbys (streaming replicas) and
    -- in read-only sessions/nodes, so the same schedule can exist everywhere
    -- without erroring. On failover, the promoted primary passes this check
    -- and takes over refreshing automatically.
    IF pg_is_in_recovery() OR current_setting('transaction_read_only')::boolean THEN
        RAISE NOTICE 'refresh_website_rollups: read-only node, skipping';
        RETURN;
    END IF;

    -- Single-runner guard: safe for multiple schedulers / load-balanced app
    -- containers to invoke concurrently. The advisory lock is database-wide
    -- (spans all connections from all hosts); try-lock semantics mean extra
    -- callers return immediately with no rows instead of queueing behind a
    -- long-running batch, so overlapping cron ticks cannot pile up.
    IF NOT pg_try_advisory_xact_lock(hashtext('refresh_website_rollups')) THEN
        RAISE NOTICE 'refresh_website_rollups: another run in progress, skipping';
        RETURN;
    END IF;

    -- Hour-align defensively: buckets are hour-truncated, so a watermark that
    -- is not on an hour boundary (e.g. set by hand during backfill) would
    -- otherwise aggregate partial hours and break idempotency.
    SELECT date_trunc('hour', processed_until) INTO v_from
    FROM rollup_watermark WHERE name = 'website_rollups';

    IF v_from IS NULL THEN
        -- First run: start at the current hour boundary; use the backfill
        -- script (03-backfill.sql) for history.
        v_from := date_trunc('hour', now());
        INSERT INTO rollup_watermark VALUES ('website_rollups', v_from)
        ON CONFLICT (name) DO NOTHING;
    END IF;

    -- Start from the older of the watermark and the lookback horizon, so the
    -- trailing window is re-aggregated on every run (the delete+insert below
    -- is idempotent per hour) and late-arriving backdated events are absorbed.
    v_from := LEAST(v_from, date_trunc('hour', now() - lookback));

    v_to := LEAST(
        v_from + make_interval(hours => max_hours),
        date_trunc('hour', now() - grace)
    );

    IF v_to <= v_from THEN
        RETURN;  -- nothing elapsed yet
    END IF;

    -- Tier 1: event-name grain
    DELETE FROM website_event_rollup_hourly
    WHERE bucket >= v_from AND bucket < v_to;

    INSERT INTO website_event_rollup_hourly
        (website_id, bucket, event_type, event_name, events)
    SELECT
        website_id,
        date_trunc('hour', created_at),
        event_type,
        COALESCE(event_name, ''),
        count(*)
    FROM website_event
    WHERE created_at >= v_from AND created_at < v_to
      AND event_type IN (1, 2)
    GROUP BY 1, 2, 3, 4;
    GET DIAGNOSTICS v_event_rows = ROW_COUNT;

    -- Tier 2: visit grain. views/min/max follow getWebsiteStats semantics
    -- (pageviews only); event_views enables exact events-page visitor counts.
    DELETE FROM website_visit_rollup_hourly
    WHERE bucket >= v_from AND bucket < v_to;

    INSERT INTO website_visit_rollup_hourly
        (website_id, bucket, session_id, visit_id, hostname,
         views, event_views, other_views, min_time, max_time, all_min_time, all_max_time)
    SELECT
        website_id,
        date_trunc('hour', created_at),
        session_id,
        visit_id,
        COALESCE(hostname, ''),
        count(*) FILTER (WHERE event_type = 1),
        count(*) FILTER (WHERE event_type = 2),
        count(*) FILTER (WHERE event_type IN (3, 4)),
        min(created_at) FILTER (WHERE event_type NOT IN (2, 5)),
        max(created_at) FILTER (WHERE event_type NOT IN (2, 5)),
        min(created_at),
        max(created_at)
    FROM website_event
    WHERE created_at >= v_from AND created_at < v_to
      AND event_type IN (1, 2, 3, 4)
    GROUP BY 1, 2, 3, 4, 5;
    GET DIAGNOSTICS v_visit_rows = ROW_COUNT;

    UPDATE rollup_watermark
    SET processed_until = GREATEST(processed_until, v_to)
    WHERE name = 'website_rollups';

    RETURN QUERY SELECT v_from, v_to, v_event_rows, v_visit_rows;
END $$;
