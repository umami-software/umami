-- Revenue is now written directly to website_revenue by saveRevenue.
-- Drop the materialized view that derived it from event_data so purchases are not counted twice.
DROP TABLE IF EXISTS umami.website_revenue_mv;
