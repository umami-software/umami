-- Rollback Migration: Remove TimescaleDB Time-Series Tables
-- Created: 2025-01-15
-- Description: Drops all TimescaleDB hypertables, continuous aggregates, and policies
-- WARNING: This will permanently delete all time-series analytics data!

-- ============================================================================
-- Step 1: Remove Continuous Aggregate Policies
-- ============================================================================
SELECT remove_continuous_aggregate_policy('website_metrics_hourly_agg', if_exists => TRUE);
SELECT remove_continuous_aggregate_policy('product_metrics_daily_agg', if_exists => TRUE);

-- ============================================================================
-- Step 2: Drop Continuous Aggregates (Materialized Views)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS website_metrics_hourly_agg CASCADE;
DROP MATERIALIZED VIEW IF EXISTS product_metrics_daily_agg CASCADE;

-- ============================================================================
-- Step 3: Remove Retention Policies
-- ============================================================================
SELECT remove_retention_policy('time_series_events', if_exists => TRUE);
SELECT remove_retention_policy('website_metrics_hourly', if_exists => TRUE);
SELECT remove_retention_policy('product_metrics_daily', if_exists => TRUE);

-- ============================================================================
-- Step 4: Drop Hypertables (this will drop the tables and all chunks)
-- ============================================================================
DROP TABLE IF EXISTS time_series_events CASCADE;
DROP TABLE IF EXISTS website_metrics_hourly CASCADE;
DROP TABLE IF EXISTS product_metrics_daily CASCADE;

-- ============================================================================
-- Step 5: Drop TimescaleDB Extension (Optional)
-- ============================================================================
-- Note: Only drop extension if no other hypertables exist
-- Uncomment the following line if you want to completely remove TimescaleDB
-- DROP EXTENSION IF EXISTS timescaledb CASCADE;

-- ============================================================================
-- Rollback Complete
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'TimescaleDB Rollback Complete';
  RAISE NOTICE 'Dropped hypertables: time_series_events, website_metrics_hourly, product_metrics_daily';
  RAISE NOTICE 'Dropped continuous aggregates: website_metrics_hourly_agg, product_metrics_daily_agg';
  RAISE NOTICE 'Removed all retention policies';
  RAISE NOTICE 'Note: TimescaleDB extension was NOT dropped (may be used by other tables)';
  RAISE NOTICE '=================================================================';
END $$;

