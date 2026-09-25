CREATE TABLE umami.commerce_event
(
    website_id UUID,
    commerce_event_id UUID,
    snapshot_id UUID,
    session_id UUID,
    visit_id UUID,
    event_name String,
    currency LowCardinality(String),
    market String,
    cart_id String,
    checkout_id String,
    order_id String,
    subtotal Decimal(19, 4),
    shipping Decimal(19, 4),
    tax Decimal(19, 4),
    total Decimal(19, 4),
    created_at DateTime64(3, 'UTC'),
    updated_at DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree(updated_at)
-- Stable partitions allow order retries to deduplicate across calendar boundaries.
PARTITION BY cityHash64(website_id) % 16
ORDER BY (website_id, commerce_event_id);

CREATE TABLE umami.commerce_item
(
    website_id UUID,
    commerce_event_id UUID,
    snapshot_id UUID,
    item_index UInt32,
    product_id String,
    name String,
    variant String,
    category String,
    price Decimal(19, 4),
    quantity UInt32,
    total Decimal(19, 4),
    created_at DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree
PARTITION BY toYYYYMM(created_at)
ORDER BY (website_id, commerce_event_id, snapshot_id, item_index);
