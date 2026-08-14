-- Add projections for website activity feeds and event property filters.
-- Note: these are intentionally not materialized here to avoid a large
-- backfill during migration on production-sized datasets.

ALTER TABLE umami.website_event
ADD PROJECTION website_event_activity_projection (
    SELECT *
    ORDER BY (
        website_id,
        created_at,
        event_id
    )
);

ALTER TABLE umami.event_data
ADD PROJECTION event_data_property_filter_projection (
    SELECT *
    ORDER BY (
        website_id,
        data_key,
        data_type,
        string_value,
        number_value,
        date_value,
        created_at,
        event_id
    )
);
