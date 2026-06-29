-- add visitor_id to event tables
ALTER TABLE umami.website_event ADD COLUMN IF NOT EXISTS visitor_id String AFTER distinct_id;
ALTER TABLE umami.website_event_stats_hourly ADD COLUMN IF NOT EXISTS visitor_id String AFTER distinct_id;

-- identity linking table
CREATE TABLE IF NOT EXISTS umami.identity_link
(
    website_id UUID,
    visitor_id String,
    distinct_id String,
    created_at DateTime('UTC'),
    linked_at DateTime('UTC')
)
ENGINE = ReplacingMergeTree(linked_at)
ORDER BY (website_id, visitor_id, distinct_id)
SETTINGS index_granularity = 8192;

-- rebuild the hourly MV so it projects visitor_id
DROP VIEW IF EXISTS umami.website_event_stats_hourly_mv;
CREATE MATERIALIZED VIEW umami.website_event_stats_hourly_mv
TO umami.website_event_stats_hourly
AS
SELECT
    website_id,
    session_id,
    visit_id,
    hostnames as hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    region,
    city,
    entry_url,
    exit_url,
    url_paths as url_path,
    url_query,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer_domain,
    page_title,
    gclid,
    fbclid,
    msclkid,
    ttclid,
    li_fat_id,
    twclid,
    event_type,
    event_name,
    views,
    min_time,
    max_time,
    tag,
    distinct_id,
    visitor_id,
    timestamp as created_at
FROM (SELECT
    website_id,
    session_id,
    visit_id,
    arrayFilter(x -> x != '', groupArray(hostname)) hostnames,
    browser,
    os,
    device,
    screen,
    language,
    country,
    region,
    city,
    argMinState(url_path, created_at) entry_url,
    argMaxState(url_path, created_at) exit_url,
    arrayFilter(x -> x != '', groupArray(url_path)) as url_paths,
    arrayFilter(x -> x != '', groupArray(url_query)) url_query,
    arrayFilter(x -> x != '', groupArray(utm_source)) utm_source,
    arrayFilter(x -> x != '', groupArray(utm_medium)) utm_medium,
    arrayFilter(x -> x != '', groupArray(utm_campaign)) utm_campaign,
    arrayFilter(x -> x != '', groupArray(utm_content)) utm_content,
    arrayFilter(x -> x != '', groupArray(utm_term)) utm_term,
    arrayFilter(x -> x != '' and x != hostname, groupArray(referrer_domain)) referrer_domain,
    arrayFilter(x -> x != '', groupArray(page_title)) page_title,
    arrayFilter(x -> x != '', groupArray(gclid)) gclid,
    arrayFilter(x -> x != '', groupArray(fbclid)) fbclid,
    arrayFilter(x -> x != '', groupArray(msclkid)) msclkid,
    arrayFilter(x -> x != '', groupArray(ttclid)) ttclid,
    arrayFilter(x -> x != '', groupArray(li_fat_id)) li_fat_id,
    arrayFilter(x -> x != '', groupArray(twclid)) twclid,
    event_type,
    if(event_type = 2, groupArray(event_name), []) event_name,
    sumIf(1, event_type NOT IN (2, 5)) views,
    min(created_at) min_time,
    max(created_at) max_time,
    arrayFilter(x -> x != '', groupArray(tag)) tag,
    distinct_id,
    visitor_id,
    toStartOfHour(created_at) timestamp
FROM umami.website_event
GROUP BY website_id,
    session_id,
    visit_id,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    region,
    city,
    event_type,
    distinct_id,
    visitor_id,
    timestamp);
