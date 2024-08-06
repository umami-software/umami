-- Create Event
CREATE TABLE umami.website_event
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
    created_at DateTime('UTC'),
    job_id Nullable(UUID)
)
    engine = MergeTree
        ORDER BY (website_id, session_id, created_at)
        SETTINGS index_granularity = 8192;

CREATE TABLE umami.event_data
(
    website_id UUID,
    session_id UUID,
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
    engine = MergeTree
        ORDER BY (website_id, event_id, data_key, created_at)
        SETTINGS index_granularity = 8192;

CREATE TABLE umami.session_data
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
    engine = MergeTree
        ORDER BY (website_id, session_id, data_key, created_at)
        SETTINGS index_granularity = 8192;

CREATE TABLE umami.event_data_blob
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
    job_id Nullable(UUID)
)
    engine = MergeTree
        ORDER BY (website_id, visit_id, event_id, created_at)
        SETTINGS index_granularity = 8192;