-- Create heatmap_event
CREATE TABLE umami.heatmap_event
(
    heatmap_event_id UUID,
    website_id UUID,
    session_id UUID,
    visit_id UUID,
    url_path String,
    event_type UInt8,
    node_id Nullable(Int32),
    x Nullable(Int32),
    y Nullable(Int32),
    viewport_w Nullable(Int32),
    viewport_h Nullable(Int32),
    scroll_pct Nullable(UInt8),
    created_at DateTime('UTC')
)
ENGINE = MergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (website_id, url_path, event_type, created_at)
    SETTINGS index_granularity = 8192;
