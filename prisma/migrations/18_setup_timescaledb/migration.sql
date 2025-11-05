-- Migration: Setup TimescaleDB for Time-Series Analytics
-- Created: 2025-01-15
-- Description: Installs TimescaleDB extension and creates hypertables for time-series data
-- Requirements: PostgreSQL 17 + TimescaleDB 2.23.0

-- ============================================================================
-- Step 1: Install TimescaleDB Extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ============================================================================
-- Step 2: Create Time-Series Events Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS time_series_events (
  time TIMESTAMPTZ NOT NULL,
  website_id UUID NOT NULL,
  session_id UUID NOT NULL,
  user_id VARCHAR(255),
  
  -- Event details
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(50),
  event_value DECIMAL(19, 4),
  properties JSONB,
  
  -- Dimensions for fast filtering
  page_url VARCHAR(500),
  product_id VARCHAR(50),
  category VARCHAR(100),
  device VARCHAR(20),
  country CHAR(2),
  
  PRIMARY KEY (time, website_id, session_id)
);

-- Convert to hypertable (partitioned by time)
SELECT create_hypertable('time_series_events', 'time',
  chunk_time_interval => INTERVAL '7 days',
  if_not_exists => TRUE
);

-- ============================================================================
-- Step 3: Create Indexes for Time-Series Queries
-- ============================================================================

-- Index for website-specific queries
CREATE INDEX IF NOT EXISTS idx_ts_events_website
  ON time_series_events (website_id, time DESC);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_ts_events_session
  ON time_series_events (session_id, time DESC);

-- Index for product-based queries (partial index for sparse data)
CREATE INDEX IF NOT EXISTS idx_ts_events_product
  ON time_series_events (product_id, time DESC)
  WHERE product_id IS NOT NULL;

-- Index for event type queries
CREATE INDEX IF NOT EXISTS idx_ts_events_event_type
  ON time_series_events (event_type, time DESC);

-- ============================================================================
-- Step 4: Create Aggregated Metrics Tables
-- ============================================================================

-- Website metrics aggregated hourly
CREATE TABLE IF NOT EXISTS website_metrics_hourly (
  time TIMESTAMPTZ NOT NULL,
  website_id UUID NOT NULL,
  
  -- Traffic metrics
  pageviews INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  avg_time_on_page INTEGER,
  avg_scroll_depth INTEGER,
  bounce_rate DECIMAL(5, 4),
  
  -- Conversion metrics
  add_to_cart_count INTEGER DEFAULT 0,
  checkout_start_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 4),
  
  -- Revenue metrics
  total_revenue DECIMAL(19, 4) DEFAULT 0,
  avg_order_value DECIMAL(19, 4),
  
  PRIMARY KEY (time, website_id)
);

-- Convert to hypertable
SELECT create_hypertable('website_metrics_hourly', 'time',
  chunk_time_interval => INTERVAL '30 days',
  if_not_exists => TRUE
);

-- Product metrics aggregated daily
CREATE TABLE IF NOT EXISTS product_metrics_daily (
  time DATE NOT NULL,
  website_id UUID NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  
  -- View metrics
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  avg_time_viewed INTEGER,
  
  -- Conversion metrics
  add_to_cart_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 4),
  
  -- Revenue metrics
  revenue DECIMAL(19, 4) DEFAULT 0,
  units_sold INTEGER DEFAULT 0,
  
  PRIMARY KEY (time, website_id, product_id)
);

-- Convert to hypertable
SELECT create_hypertable('product_metrics_daily', 'time',
  chunk_time_interval => INTERVAL '30 days',
  if_not_exists => TRUE
);

-- ============================================================================
-- Step 5: Create Continuous Aggregates (Materialized Views)
-- ============================================================================

-- Hourly website metrics continuous aggregate
CREATE MATERIALIZED VIEW IF NOT EXISTS website_metrics_hourly_agg
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS time,
  website_id,
  COUNT(*) FILTER (WHERE event_type = 'pageview') as pageviews,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
  COUNT(*) FILTER (WHERE event_name = 'add_to_cart') as add_to_cart_count,
  COUNT(*) FILTER (WHERE event_name = 'checkout_start') as checkout_start_count,
  COUNT(*) FILTER (WHERE event_name = 'purchase') as purchase_count,
  SUM(event_value) FILTER (WHERE event_name = 'purchase') as total_revenue
FROM time_series_events
GROUP BY time_bucket('1 hour', time), website_id;

-- Add refresh policy for continuous aggregate
SELECT add_continuous_aggregate_policy('website_metrics_hourly_agg',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- Daily product metrics continuous aggregate
CREATE MATERIALIZED VIEW IF NOT EXISTS product_metrics_daily_agg
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', time) AS time,
  website_id,
  product_id,
  COUNT(*) FILTER (WHERE event_name = 'product_view') as views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'product_view') as unique_viewers,
  COUNT(*) FILTER (WHERE event_name = 'add_to_cart') as add_to_cart_count,
  COUNT(*) FILTER (WHERE event_name = 'purchase') as purchase_count,
  SUM(event_value) FILTER (WHERE event_name = 'purchase') as revenue
FROM time_series_events
WHERE product_id IS NOT NULL
GROUP BY time_bucket('1 day', time), website_id, product_id;

-- Add refresh policy for product metrics
SELECT add_continuous_aggregate_policy('product_metrics_daily_agg',
  start_offset => INTERVAL '7 days',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- ============================================================================
-- Step 6: Create Data Retention Policies
-- ============================================================================

-- Retain raw time-series events for 90 days
SELECT add_retention_policy('time_series_events',
  INTERVAL '90 days',
  if_not_exists => TRUE
);

-- Retain hourly aggregates for 1 year
SELECT add_retention_policy('website_metrics_hourly',
  INTERVAL '1 year',
  if_not_exists => TRUE
);

-- Retain daily product metrics for 2 years
SELECT add_retention_policy('product_metrics_daily',
  INTERVAL '2 years',
  if_not_exists => TRUE
);

-- ============================================================================
-- Migration Complete
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'TimescaleDB Migration Complete';
  RAISE NOTICE 'Hypertables: time_series_events, website_metrics_hourly, product_metrics_daily';
  RAISE NOTICE 'Continuous Aggregates: website_metrics_hourly_agg, product_metrics_daily_agg';
  RAISE NOTICE 'Retention Policies: 90 days (raw), 1 year (hourly), 2 years (daily)';
  RAISE NOTICE '=================================================================';
END $$;

