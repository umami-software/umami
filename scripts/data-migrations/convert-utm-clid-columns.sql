-----------------------------------------------------
-- postgreSQL
-----------------------------------------------------
UPDATE "website_event" we
SET fbclid = url.fbclid,
    gclid = url.gclid,
    li_fat_id = url.li_fat_id,
    msclkid = url.msclkid,
    ttclid = url.ttclid,
    twclid = url.twclid,
    utm_campaign = url.utm_campaign,
    utm_content = url.utm_content,
    utm_medium = url.utm_medium,
    utm_source = url.utm_source,
    utm_term = url.utm_term
FROM (SELECT event_id, website_id, session_id,
          (regexp_matches(url_query, '(?:[&?]|^)fbclid=([^&]+)', 'i'))[1] AS fbclid,
          (regexp_matches(url_query, '(?:[&?]|^)gclid=([^&]+)', 'i'))[1] AS gclid,
          (regexp_matches(url_query, '(?:[&?]|^)li_fat_id=([^&]+)', 'i'))[1] AS li_fat_id,
          (regexp_matches(url_query, '(?:[&?]|^)msclkid=([^&]+)', 'i'))[1] AS msclkid,
          (regexp_matches(url_query, '(?:[&?]|^)ttclid=([^&]+)', 'i'))[1] AS ttclid,
          (regexp_matches(url_query, '(?:[&?]|^)twclid=([^&]+)', 'i'))[1] AS twclid,
          (regexp_matches(url_query, '(?:[&?]|^)utm_campaign=([^&]+)', 'i'))[1] AS utm_campaign,
          (regexp_matches(url_query, '(?:[&?]|^)utm_content=([^&]+)', 'i'))[1] AS utm_content,
          (regexp_matches(url_query, '(?:[&?]|^)utm_medium=([^&]+)', 'i'))[1] AS utm_medium,
          (regexp_matches(url_query, '(?:[&?]|^)utm_source=([^&]+)', 'i'))[1] AS utm_source,
          (regexp_matches(url_query, '(?:[&?]|^)utm_term=([^&]+)', 'i'))[1] AS utm_term
    FROM "website_event") url
WHERE we.event_id = url.event_id
    and we.session_id = url.session_id
    and we.website_id = url.website_id;

-----------------------------------------------------
-- mySQL
-----------------------------------------------------
UPDATE `website_event`
SET fbclid = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)fbclid=[^&]+'), '=', -1), '&', 1),
    gclid = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)gclid=[^&]+'), '=', -1), '&', 1),
    li_fat_id = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)li_fat_id=[^&]+'), '=', -1), '&', 1),
    msclkid = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)msclkid=[^&]+'), '=', -1), '&', 1),
    ttclid = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)ttclid=[^&]+'), '=', -1), '&', 1),
    twclid = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)twclid=[^&]+'), '=', -1), '&', 1),
    utm_campaign = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_campaign=[^&]+'), '=', -1), '&', 1),
    utm_content = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_content=[^&]+'), '=', -1), '&', 1),
    utm_medium = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_medium=[^&]+'), '=', -1), '&', 1),
    utm_source = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_source=[^&]+'), '=', -1), '&', 1),
    utm_term = SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_term=[^&]+'), '=', -1), '&', 1)
WHERE 1 = 1;