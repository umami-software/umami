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
    page_x Nullable(Int32),
    page_y Nullable(Int32),
    page_w Nullable(Int32),
    viewport_w Nullable(Int32),
    viewport_h Nullable(Int32),
    page_h Nullable(Int32),
    scroll_pct Nullable(UInt8),
    replay_chunk_index Nullable(UInt32),
    replay_event_index Nullable(UInt32),
    replay_time_ms Nullable(Int64),
    created_at DateTime('UTC')
)
ENGINE = MergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (website_id, url_path, event_type, created_at)
    SETTINGS index_granularity = 8192;

-- Create heatmap_snapshot
CREATE TABLE umami.heatmap_snapshot
(
    snapshot_id UUID,
    website_id UUID,
    url_path String,
    viewport_w UInt32,
    viewport_h UInt32,
    page_w UInt32,
    page_h UInt32,
    status UInt8,
    mime_type LowCardinality(String),
    object_key String,
    image_size Nullable(UInt32),
    error Nullable(String),
    created_at DateTime('UTC')
)
ENGINE = MergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (website_id, url_path, viewport_w, viewport_h, created_at)
    SETTINGS index_granularity = 8192;
