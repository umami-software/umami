-- Rollback Migration: Remove WooCommerce and Enhanced Tracking Fields
-- Created: 2025-01-15
-- Description: Removes WooCommerce e-commerce tracking fields and enhanced engagement metrics from website_event table
-- WARNING: This will permanently delete all WooCommerce tracking data!

-- Drop indexes first (must be done before dropping columns)
DROP INDEX IF EXISTS idx_website_event_wc_product;
DROP INDEX IF EXISTS idx_website_event_wc_category;
DROP INDEX IF EXISTS idx_website_event_wc_order;
DROP INDEX IF EXISTS idx_website_event_wc_revenue;
DROP INDEX IF EXISTS idx_website_event_engagement;

-- Remove WooCommerce e-commerce tracking fields
ALTER TABLE website_event
  DROP COLUMN IF EXISTS wc_product_id,
  DROP COLUMN IF EXISTS wc_category_id,
  DROP COLUMN IF EXISTS wc_cart_value,
  DROP COLUMN IF EXISTS wc_checkout_step,
  DROP COLUMN IF EXISTS wc_order_id,
  DROP COLUMN IF EXISTS wc_revenue;

-- Remove enhanced engagement tracking fields
ALTER TABLE website_event
  DROP COLUMN IF EXISTS scroll_depth,
  DROP COLUMN IF EXISTS time_on_page,
  DROP COLUMN IF EXISTS click_count,
  DROP COLUMN IF EXISTS form_interactions;

-- Log rollback completion
DO $$
BEGIN
  RAISE NOTICE 'Rollback complete: WooCommerce and enhanced tracking fields removed from website_event table';
END $$;

