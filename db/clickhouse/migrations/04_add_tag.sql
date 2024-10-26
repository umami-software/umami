-- add tag column
ALTER TABLE umami.website_event ADD COLUMN "tag" String AFTER "event_name";
ALTER TABLE umami.website_event_stats_hourly ADD COLUMN "tag" SimpleAggregateFunction(groupArrayArray, Array(String)) AFTER "max_time";

-- update materialized view
DROP TABLE umami.website_event_stats_hourly_mv;

CREATE MATERIALIZED VIEW umami.website_event_stats_hourly_mv
TO umami.website_event_stats_hourly
AS
SELECT
    website_id,
    session_id,
    visit_id,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    subdivision1,
    city,
    entry_url,
    exit_url,
    url_paths as url_path,
    url_query,
    referrer_domain,
    page_title,
    event_type,
    event_name,
    views,
    min_time,
    max_time,
    tag,
    timestamp as created_at
FROM (SELECT
    website_id,
    session_id,
    visit_id,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    subdivision1,
    city,
    argMinState(url_path, created_at) entry_url,
    argMaxState(url_path, created_at) exit_url,
    arrayFilter(x -> x != '', groupArray(url_path)) as url_paths,
    arrayFilter(x -> x != '', groupArray(url_query)) url_query,
    arrayFilter(x -> x != '', groupArray(referrer_domain)) referrer_domain,
    arrayFilter(x -> x != '', groupArray(page_title)) page_title,
    event_type,
    if(event_type = 2, groupArray(event_name), []) event_name,
    sumIf(1, event_type = 1) views,
    min(created_at) min_time,
    max(created_at) max_time,
    arrayFilter(x -> x != '', groupArray(tag)) tag,
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
    subdivision1,
    city,
    event_type,
    timestamp);