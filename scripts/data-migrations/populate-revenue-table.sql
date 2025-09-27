-----------------------------------------------------
-- PostgreSQL
-----------------------------------------------------
INSERT INTO "revenue"
SELECT gen_random_uuid() revenue_id,
    ed.website_id,
    we.session_id,
    we.event_id,
    we.event_name,
    currency.string_value currency,
    coalesce(ed.number_value, cast(ed.string_value as numeric(19,4))) revenue,
    ed.created_at
FROM event_data ed
JOIN website_event we 
ON we.event_id = ed.website_event_id
JOIN (SELECT website_event_id, string_value
      FROM event_data
      WHERE data_key ilike '%currency%') currency
ON currency.website_event_id = ed.website_event_id
WHERE ed.data_key ilike '%revenue%';

-----------------------------------------------------
-- MySQL
-----------------------------------------------------
INSERT INTO `revenue`
SELECT UUID() revenue_id,
    ed.website_id,
    we.session_id,
    we.event_id,
    we.event_name,
    currency.string_value currency,
    coalesce(ed.number_value, cast(ed.string_value as decimal(19,4))) revenue,
    ed.created_at
FROM event_data ed
JOIN website_event we
ON we.event_id = ed.website_event_id
JOIN (SELECT website_event_id, string_value
      FROM event_data
      WHERE data_key like '%currency%') currency
ON currency.website_event_id = ed.website_event_id
WHERE ed.data_key like '%revenue%';