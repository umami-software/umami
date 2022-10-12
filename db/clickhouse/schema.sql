SET allow_experimental_object_type = 1;

-- Create Event
CREATE TABLE event
(
    website_id UUID,
    session_id UUID,
    event_id Nullable(UUID),
    --session
    hostname LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    device LowCardinality(String),
    screen LowCardinality(String),
    language LowCardinality(String),
    country LowCardinality(String),
    --pageview
    url String,
    referrer String,
    --event
    event_name String,
    event_data JSON,
    created_at DateTime('UTC')
)
    engine = MergeTree
        ORDER BY (website_id, session_id, created_at)
        SETTINGS index_granularity = 8192;

CREATE TABLE event_queue (
    website_id UUID,
    session_id UUID,
    event_id Nullable(UUID),
    url String,
    referrer String,
    hostname LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    device LowCardinality(String),
    screen LowCardinality(String),
    language LowCardinality(String),
    country LowCardinality(String),
    event_name String,
    event_data String,
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
    url,
    referrer,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    event_name,
    event_data,
    created_at
FROM event_queue;