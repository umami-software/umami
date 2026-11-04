-- =========================================================================
-- Scheduling. Preferred: pg_cron (PGDG package postgresql-16-cron;
-- shared_preload_libraries = 'pg_cron', cron.database_name = 'umami').
-- =========================================================================
SELECT cron.schedule(
    'refresh-website-rollups',
    '*/5 * * * *',
    $$SELECT refresh_website_rollups()$$
);

-- Alternative without pg_cron: any external scheduler works, since the
-- function is self-contained and idempotent, e.g. a sidecar container:
--   */5 * * * *  psql "$DATABASE_URL" -c "SELECT refresh_website_rollups();"
