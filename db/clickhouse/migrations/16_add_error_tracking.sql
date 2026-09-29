CREATE TABLE IF NOT EXISTS umami.error_event
(
    website_id UUID,
    event_id UUID,
    issue_id UUID,
    session_id UUID,
    visit_id UUID,
    created_at DateTime64(3, 'UTC'),
    received_at DateTime64(3, 'UTC'),
    name String,
    message String,
    stack String CODEC(ZSTD(3)),
    frames String CODEC(ZSTD(3)),
    tags String,
    handled Bool,
    url_path String,
    release String,
    environment LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    device LowCardinality(String)
)
ENGINE = ReplacingMergeTree
-- A retry always reaches the same partition, including across month boundaries.
PARTITION BY cityHash64(website_id) % 16
ORDER BY (website_id, event_id)
TTL toDateTime(received_at) + INTERVAL 90 DAY DELETE;
