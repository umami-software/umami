-- Create website_engagement
CREATE TABLE umami.website_engagement
(
    website_id UUID,
    session_id UUID,
    visit_id UUID,
    url_path String,
    engagement_time UInt32,
    created_at DateTime('UTC')
)
ENGINE = MergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (website_id, created_at, visit_id)
    SETTINGS index_granularity = 8192;
