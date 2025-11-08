-----------------------------------------------------
-- PostgreSQL
-----------------------------------------------------
UPDATE "website_event" we
SET fbclid = LEFT(url.fbclid, 255),
    gclid = LEFT(url.gclid, 255),
    li_fat_id = LEFT(url.li_fat_id, 255),
    msclkid = LEFT(url.msclkid, 255),
    ttclid = LEFT(url.ttclid, 255),
    twclid = LEFT(url.twclid, 255),
    utm_campaign = LEFT(url.utm_campaign, 255),
    utm_content = LEFT(url.utm_content, 255),
    utm_medium = LEFT(url.utm_medium, 255),
    utm_source = LEFT(url.utm_source, 255),
    utm_term = LEFT(url.utm_term, 255)
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
    FROM "website_event"
    WHERE url_query IS NOT NULL) url
WHERE we.event_id = url.event_id
    and we.session_id = url.session_id
    and we.website_id = url.website_id;

-----------------------------------------------------
-- MySQL
-----------------------------------------------------
UPDATE `website_event`
SET fbclid = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)fbclid=[^&]+'), '=', -1), '&', 1), 255),
    gclid = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)gclid=[^&]+'), '=', -1), '&', 1), 255),
    li_fat_id = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)li_fat_id=[^&]+'), '=', -1), '&', 1), 255),
    msclkid = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)msclkid=[^&]+'), '=', -1), '&', 1), 255),
    ttclid = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)ttclid=[^&]+'), '=', -1), '&', 1), 255),
    twclid = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)twclid=[^&]+'), '=', -1), '&', 1), 255),
    utm_campaign = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_campaign=[^&]+'), '=', -1), '&', 1), 255),
    utm_content = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_content=[^&]+'), '=', -1), '&', 1), 255),
    utm_medium = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_medium=[^&]+'), '=', -1), '&', 1), 255),
    utm_source = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_source=[^&]+'), '=', -1), '&', 1), 255),
    utm_term = LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(REGEXP_SUBSTR(url_query, '(?:[&?]|^)utm_term=[^&]+'), '=', -1), '&', 1), 255)
WHERE url_query IS NOT NULL;
