-- Migration: Add WooCommerce and Enhanced Tracking Fields
-- Created: 2025-01-15
-- Description: Adds WooCommerce e-commerce tracking fields and enhanced engagement metrics to website_event table

-- Add enhanced engagement tracking fields
ALTER TABLE website_event
  ADD COLUMN IF NOT EXISTS scroll_depth INTEGER,
  ADD COLUMN IF NOT EXISTS time_on_page INTEGER,
  ADD COLUMN IF NOT EXISTS click_count INTEGER,
  ADD COLUMN IF NOT EXISTS form_interactions JSONB;

-- Add WooCommerce e-commerce tracking fields
ALTER TABLE website_event
  ADD COLUMN IF NOT EXISTS wc_product_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS wc_category_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS wc_cart_value DECIMAL(19, 4),
  ADD COLUMN IF NOT EXISTS wc_checkout_step INTEGER,
  ADD COLUMN IF NOT EXISTS wc_order_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS wc_revenue DECIMAL(19, 4);

-- Create indexes for WooCommerce queries (performance optimization)
-- Index for product-based queries
CREATE INDEX IF NOT EXISTS idx_website_event_wc_product 
  ON website_event(website_id, wc_product_id, created_at)
  WHERE wc_product_id IS NOT NULL;

-- Index for category-based queries
CREATE INDEX IF NOT EXISTS idx_website_event_wc_category 
  ON website_event(website_id, wc_category_id, created_at)
  WHERE wc_category_id IS NOT NULL;

-- Index for order-based queries (partial index for sparse data)
CREATE INDEX IF NOT EXISTS idx_website_event_wc_order 
  ON website_event(wc_order_id)
  WHERE wc_order_id IS NOT NULL;

-- Index for revenue analysis
CREATE INDEX IF NOT EXISTS idx_website_event_wc_revenue
  ON website_event(website_id, created_at, wc_revenue)
  WHERE wc_revenue IS NOT NULL;

-- Index for engagement metrics
CREATE INDEX IF NOT EXISTS idx_website_event_engagement
  ON website_event(website_id, created_at, scroll_depth, time_on_page)
  WHERE scroll_depth IS NOT NULL OR time_on_page IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN website_event.scroll_depth IS 'Percentage of page scrolled (0-100)';
COMMENT ON COLUMN website_event.time_on_page IS 'Time spent on page in seconds';
COMMENT ON COLUMN website_event.click_count IS 'Number of clicks on the page';
COMMENT ON COLUMN website_event.form_interactions IS 'JSONB array of form interaction events';
COMMENT ON COLUMN website_event.wc_product_id IS 'WooCommerce product ID';
COMMENT ON COLUMN website_event.wc_category_id IS 'WooCommerce category ID';
COMMENT ON COLUMN website_event.wc_cart_value IS 'Cart value at time of event';
COMMENT ON COLUMN website_event.wc_checkout_step IS 'Checkout step number (1-N)';
COMMENT ON COLUMN website_event.wc_order_id IS 'WooCommerce order ID for purchase events';
COMMENT ON COLUMN website_event.wc_revenue IS 'Revenue amount for purchase events';

