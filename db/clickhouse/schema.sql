SET allow_experimental_object_type = 1;

-- Create Event
CREATE TABLE event
(
    website_id UUID,
    session_id UUID,
    event_id Nullable(UUID),
    rev_id UInt32,
    --session
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
    --pageview
    url_path String,
    url_query String,
    referrer_path String,
    referrer_query String,
    referrer_domain String,
    page_title String,
    --event
    event_type UInt32,
    event_name String,
    created_at DateTime('UTC')
)
    engine = MergeTree
        ORDER BY (website_id, session_id, created_at)
        SETTINGS index_granularity = 8192;

CREATE TABLE event_queue (
    website_id UUID,
    session_id UUID,
    event_id Nullable(UUID),
    rev_id UInt32,
    --session
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
    --pageview
    url_path String,
    url_query String,
    referrer_path String,
    referrer_query String,
    referrer_domain String,
    page_title String,
    --event
    event_type UInt32,
    event_name String,
    created_at DateTime('UTC')
)
ENGINE = Kafka
SETTINGS kafka_broker_list = 'domain:9092,domain:9093,domain:9094', -- input broker list
       kafka_topic_list = 'event',
       kafka_group_name = 'event_consumer_group',
       kafka_format = 'JSONEachRow',
       kafka_max_block_size = 1048576,
       kafka_skip_broken_messages = 1;

CREATE MATERIALIZED VIEW event_queue_mv TO event AS
SELECT website_id,
    session_id,
    event_id,
    rev_id,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    subdivision1,
    subdivision2,
    city,
    url_path,
    url_query,
    referrer_path,
    referrer_query,
    referrer_domain,
    page_title,
    event_type,
    event_name,
    created_at
FROM event_queue;