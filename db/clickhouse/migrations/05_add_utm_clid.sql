-- Create Event
CREATE TABLE umami.website_event_new
(
    website_id UUID,
    session_id UUID,
    visit_id UUID,
    event_id UUID,
    --sessions
    hostname LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    device LowCardinality(String),
    screen LowCardinality(String),
    language LowCardinality(String),
    country LowCardinality(String),
    subdivision1 LowCardinality(String),
    subdivision2 LowCardinality(String),
    city String,
    --pageviews
    url_path String,
    url_query String,
    utm_source String,
    utm_medium String,
    utm_campaign String,
    utm_content String,
    utm_term String,
    referrer_path String,
    referrer_query String,
    referrer_domain String,
    page_title String,
    gclid String,
    fbclid String,
    --events
    event_type UInt32,
    event_name String,
    tag String,
    created_at DateTime('UTC'),
    job_id Nullable(UUID)
)
ENGINE = MergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (toStartOfHour(created_at), website_id, session_id, visit_id, created_at)
    PRIMARY KEY (toStartOfHour(created_at), website_id, session_id, visit_id)
    SETTINGS index_granularity = 8192;

-- stats hourly
CREATE TABLE umami.website_event_stats_hourly_new
(
    website_id UUID,
    session_id UUID,
    visit_id UUID,
    hostname LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    device LowCardinality(String),
    screen LowCardinality(String),
    language LowCardinality(String),
    country LowCardinality(String),
    subdivision1 LowCardinality(String),
    city String,
    entry_url AggregateFunction(argMin, String, DateTime('UTC')),
    exit_url AggregateFunction(argMax, String, DateTime('UTC')),
    url_path SimpleAggregateFunction(groupArrayArray, Array(String)),
    url_query SimpleAggregateFunction(groupArrayArray, Array(String)),
    utm_source SimpleAggregateFunction(groupArrayArray, Array(String)),
    utm_medium SimpleAggregateFunction(groupArrayArray, Array(String)),
    utm_campaign SimpleAggregateFunction(groupArrayArray, Array(String)),
    utm_content SimpleAggregateFunction(groupArrayArray, Array(String)),
    utm_term SimpleAggregateFunction(groupArrayArray, Array(String)),
    referrer_domain SimpleAggregateFunction(groupArrayArray, Array(String)),
    page_title SimpleAggregateFunction(groupArrayArray, Array(String)),
    gclid SimpleAggregateFunction(groupArrayArray, Array(String)),
    fbclid SimpleAggregateFunction(groupArrayArray, Array(String)),
    event_type UInt32,
    event_name SimpleAggregateFunction(groupArrayArray, Array(String)),
    views SimpleAggregateFunction(sum, UInt64),
    min_time SimpleAggregateFunction(min, DateTime('UTC')),
    max_time SimpleAggregateFunction(max, DateTime('UTC')),
    tag SimpleAggregateFunction(groupArrayArray, Array(String)),
    created_at Datetime('UTC')
)
ENGINE = AggregatingMergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (
        website_id,
        event_type,
        toStartOfHour(created_at),
        cityHash64(visit_id),
        visit_id
    )
    SAMPLE BY cityHash64(visit_id);

CREATE MATERIALIZED VIEW umami.website_event_stats_hourly_mv_new
TO umami.website_event_stats_hourly_new
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
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer_domain,
    page_title,
    gclid,
    fbclid,
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
    arrayFilter(x -> x != '', groupArray(utm_source)) utm_source,
    arrayFilter(x -> x != '', groupArray(utm_medium)) utm_medium,
    arrayFilter(x -> x != '', groupArray(utm_campaign)) utm_campaign,
    arrayFilter(x -> x != '', groupArray(utm_content)) utm_content,
    arrayFilter(x -> x != '', groupArray(utm_term)) utm_term,
    arrayFilter(x -> x != '', groupArray(referrer_domain)) referrer_domain,
    arrayFilter(x -> x != '', groupArray(page_title)) page_title,
    arrayFilter(x -> x != '', groupArray(gclid)) gclid,
    arrayFilter(x -> x != '', groupArray(fbclid)) fbclid,
    event_type,
    if(event_type = 2, groupArray(event_name), []) event_name,
    sumIf(1, event_type = 1) views,
    min(created_at) min_time,
    max(created_at) max_time,
    arrayFilter(x -> x != '', groupArray(tag)) tag,
    toStartOfHour(created_at) timestamp
FROM umami.website_event_new
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

-- projections
ALTER TABLE umami.website_event_new
ADD PROJECTION website_event_url_path_projection (
SELECT * ORDER BY toStartOfDay(created_at), website_id, url_path, created_at
);

ALTER TABLE umami.website_event_new MATERIALIZE PROJECTION website_event_url_path_projection_new;

ALTER TABLE umami.website_event_new
ADD PROJECTION website_event_referrer_domain_projection (
SELECT * ORDER BY toStartOfDay(created_at), website_id, referrer_domain, created_at
);

ALTER TABLE umami.website_event_new MATERIALIZE PROJECTION website_event_referrer_domain_projection;

-- migration
INSERT INTO umami.website_event_new
SELECT website_id, session_id, visit_id, event_id, hostname, browser, os, device, screen, language, country, subdivision1, subdivision2, city, url_path, url_query,
    extract(url_query, 'utm_source=([^&]*)') AS utm_source,
    extract(url_query, 'utm_medium=([^&]*)') AS utm_medium,
    extract(url_query, 'utm_campaign=([^&]*)') AS utm_campaign,
    extract(url_query, 'utm_content=([^&]*)') AS utm_content,
    extract(url_query, 'utm_term=([^&]*)') AS utm_term,referrer_path, referrer_query, referrer_domain,
    page_title,
    extract(url_query, 'gclid=([^&]*)') gclid,
    extract(url_query, 'fbclid=([^&]*)') fbclid,
    event_type, event_name, tag, created_at, job_id
FROM umami.website_event

-- rename tables
RENAME TABLE umami.website_event TO umami.website_event_old;
RENAME TABLE umami.website_event_new TO umami.website_event;

RENAME TABLE umami.website_event_stats_hourly TO umami.website_event_stats_hourly_old;
RENAME TABLE umami.website_event_stats_hourly_new TO umami.website_event_stats_hourly;

RENAME TABLE umami.website_event_stats_hourly_mv TO umami.website_event_stats_hourly_mv_old;
RENAME TABLE umami.website_event_stats_hourly_mv_new TO umami.website_event_stats_hourly_mv;

-- recreate view
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
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer_domain,
    page_title,
    gclid,
    fbclid,
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
    arrayFilter(x -> x != '', groupArray(utm_source)) utm_source,
    arrayFilter(x -> x != '', groupArray(utm_medium)) utm_medium,
    arrayFilter(x -> x != '', groupArray(utm_campaign)) utm_campaign,
    arrayFilter(x -> x != '', groupArray(utm_content)) utm_content,
    arrayFilter(x -> x != '', groupArray(utm_term)) utm_term,
    arrayFilter(x -> x != '', groupArray(referrer_domain)) referrer_domain,
    arrayFilter(x -> x != '', groupArray(page_title)) page_title,
    arrayFilter(x -> x != '', groupArray(gclid)) gclid,
    arrayFilter(x -> x != '', groupArray(fbclid)) fbclid,
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