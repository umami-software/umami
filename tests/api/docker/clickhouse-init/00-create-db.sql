-- CLICKHOUSE_DB already creates this before init scripts run; kept as a guard so
-- db/clickhouse/schema.sql (which hardcodes the `umami.` prefix) never fails.
CREATE DATABASE IF NOT EXISTS umami;
