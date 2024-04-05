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
    job_id UUID
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
    event_key String,
    string_value Nullable(String),
    number_value Nullable(Decimal64(4)), --922337203685477.5625
    date_value Nullable(DateTime('UTC')),
    data_type UInt32,
    created_at DateTime('UTC'),
    job_id UUID
)
    engine = MergeTree
        ORDER BY (website_id, event_id, event_key, created_at)
        SETTINGS index_granularity = 8192;