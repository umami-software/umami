-- Create Event
CREATE TABLE website_event
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
    ip Nullable(String),
    lat Nullable(Float32),
    lng Nullable(Float32),
    --pageviews
    url_path String,
    url_query String,
    referrer_path String,
    referrer_query String,
    referrer_domain String,
    page_title String,
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

CREATE TABLE event_data
(
    website_id UUID,
    session_id UUID,
    visit_id UUID,
    event_id UUID,
    url_path String,
    event_name String,
    data_key String,
    string_value Nullable(String),
    number_value Nullable(Decimal64(4)),
    date_value Nullable(DateTime('UTC')),
    data_type UInt32,
    created_at DateTime('UTC'),
    job_id Nullable(UUID)
)
ENGINE = MergeTree
    ORDER BY (website_id, event_id, data_key, created_at)
    SETTINGS index_granularity = 8192;

CREATE TABLE session_data
(
    website_id UUID,
    session_id UUID,
    data_key String,
    string_value Nullable(String),
    number_value Nullable(Decimal64(4)),
    date_value Nullable(DateTime('UTC')),
    data_type UInt32,
    created_at DateTime('UTC'),
    job_id Nullable(UUID)
)
ENGINE = ReplacingMergeTree
    ORDER BY (website_id, session_id, data_key)
    SETTINGS index_granularity = 8192;

CREATE TABLE event_data_blob
(
    website_id UUID,
    session_id UUID,
    visit_id UUID,
    event_id UUID,
    blob1 Nullable(String),
    blob2 Nullable(String),
    blob3 Nullable(String),
    blob4 Nullable(String),
    blob5 Nullable(String),
    blob6 Nullable(String),
    blob7 Nullable(String),
    blob8 Nullable(String),
    blob9 Nullable(String),
    blob10 Nullable(String),
    blob11 Nullable(String),
    blob12 Nullable(String),
    blob13 Nullable(String),
    blob14 Nullable(String),
    blob15 Nullable(String),
    blob16 Nullable(String),
    blob17 Nullable(String),
    blob18 Nullable(String),
    blob19 Nullable(String),
    blob20 Nullable(String),
    double1 Nullable(Decimal64(4)),
    double2 Nullable(Decimal64(4)),
    double3 Nullable(Decimal64(4)),
    double4 Nullable(Decimal64(4)),
    double5 Nullable(Decimal64(4)),
    double6 Nullable(Decimal64(4)),
    double7 Nullable(Decimal64(4)),
    double8 Nullable(Decimal64(4)),
    double9 Nullable(Decimal64(4)),
    double10 Nullable(Decimal64(4)),
    double11 Nullable(Decimal64(4)),
    double12 Nullable(Decimal64(4)),
    double13 Nullable(Decimal64(4)),
    double14 Nullable(Decimal64(4)),
    double15 Nullable(Decimal64(4)),
    double16 Nullable(Decimal64(4)),
    double17 Nullable(Decimal64(4)),
    double18 Nullable(Decimal64(4)),
    double19 Nullable(Decimal64(4)),
    double20 Nullable(Decimal64(4)),
    created_at DateTime('UTC'),
    event_name Nullable(String),
    job_id Nullable(UUID)
)
    engine = MergeTree
        ORDER BY (website_id, visit_id, event_id, created_at)
        SETTINGS index_granularity = 8192;

-- stats hourly
CREATE TABLE website_event_stats_hourly
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
    referrer_domain SimpleAggregateFunction(groupArrayArray, Array(String)),
    page_title SimpleAggregateFunction(groupArrayArray, Array(String)),
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

CREATE MATERIALIZED VIEW website_event_stats_hourly_mv
TO website_event_stats_hourly
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
FROM website_event
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
ALTER TABLE website_event 
ADD PROJECTION website_event_url_path_projection (
SELECT * ORDER BY toStartOfDay(created_at), website_id, url_path, created_at
);

ALTER TABLE website_event MATERIALIZE PROJECTION website_event_url_path_projection;

ALTER TABLE website_event 
ADD PROJECTION website_event_referrer_domain_projection (
SELECT * ORDER BY toStartOfDay(created_at), website_id, referrer_domain, created_at
);

ALTER TABLE website_event MATERIALIZE PROJECTION website_event_referrer_domain_projection;

