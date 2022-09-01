SET allow_experimental_object_type = 1;

-- Create Pageview
CREATE TABLE pageview
(
    website_id UInt32,
    session_uuid UUID,
    created_at DateTime('UTC'),
    url String,
    referrer String
)
    engine = MergeTree PRIMARY KEY (session_uuid, created_at)
        ORDER BY (session_uuid, created_at)
        SETTINGS index_granularity = 8192;

CREATE TABLE pageview_queue (
    website_id UInt32,
    session_uuid UUID,
    created_at DateTime('UTC'),
    url String,
    referrer String
)
ENGINE = Kafka
SETTINGS kafka_broker_list = 'kafka1:19092,kafka2:19093,kafka3:19094', -- input broker list
       kafka_topic_list = 'pageview',
       kafka_group_name = 'pageview_consumer_group',
       kafka_format = 'JSONEachRow',
       kafka_max_block_size = 1048576,
       kafka_skip_broken_messages = 1;

CREATE MATERIALIZED VIEW pageview_queue_mv TO pageview AS
SELECT website_id,
    session_uuid,
    created_at,
    url,
    referrer
FROM pageview_queue;

-- Create Session
CREATE TABLE session
(
    session_uuid UUID,
    website_id UInt32,
    created_at DateTime('UTC'),
    hostname LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    device LowCardinality(String),
    screen LowCardinality(String),
    language LowCardinality(String),
    country LowCardinality(String)
)
    engine = MergeTree PRIMARY KEY (session_uuid, created_at)
        ORDER BY (session_uuid, created_at)
        SETTINGS index_granularity = 8192;

CREATE TABLE session_queue (
    session_uuid UUID,
    website_id UInt32,
    created_at DateTime('UTC'),
    hostname LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    device LowCardinality(String),
    screen LowCardinality(String),
    language LowCardinality(String),
    country LowCardinality(String)
)
ENGINE = Kafka
SETTINGS kafka_broker_list = 'kafka1:19092,kafka2:19093,kafka3:19094', -- input broker list
       kafka_topic_list = 'session',
       kafka_group_name = 'session_consumer_group',
       kafka_format = 'JSONEachRow',
       kafka_max_block_size = 1048576,
       kafka_skip_broken_messages = 1;

CREATE MATERIALIZED VIEW session_queue_mv TO session AS
SELECT session_uuid,
    website_id,
    created_at,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country
FROM session_queue;

-- Create event
CREATE TABLE event
(
    event_uuid UUID,
    website_id UInt32,
    session_uuid UUID,
    created_at DateTime('UTC'),
    url String,
    event_name String,
    event_data JSON
)
    engine = MergeTree PRIMARY KEY (event_uuid, created_at)
        ORDER BY (event_uuid, created_at)
        SETTINGS index_granularity = 8192;

CREATE TABLE event_queue (
    event_uuid UUID,
    website_id UInt32,
    session_uuid UUID,
    created_at DateTime('UTC'),
    url String,
    event_name String,
    event_data String
)
ENGINE = Kafka
SETTINGS kafka_broker_list = 'kafka1:19092,kafka2:19093,kafka3:19094', -- input broker list
       kafka_topic_list = 'event',
       kafka_group_name = 'event_consumer_group',
       kafka_format = 'JSONEachRow',
       kafka_max_block_size = 1048576,
       kafka_skip_broken_messages = 1;

CREATE MATERIALIZED VIEW event_queue_mv TO event AS
SELECT event_uuid,
    website_id,
    session_uuid,
    created_at,
    url,
    event_name,
    event_data
FROM event_queue;
