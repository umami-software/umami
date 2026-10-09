-- Create session_link
CREATE TABLE umami.session_link
(
    website_id UUID,
    session_id UUID,
    distinct_id String,
    created_at DateTime('UTC'),
    INDEX idx_session_id session_id TYPE bloom_filter GRANULARITY 1
)
ENGINE = ReplacingMergeTree
    ORDER BY (website_id, distinct_id, session_id)
    SETTINGS index_granularity = 8192;
