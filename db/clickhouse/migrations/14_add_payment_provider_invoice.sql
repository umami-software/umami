-- Create payment_provider_invoice
CREATE TABLE umami.payment_provider_invoice
(
    line_id              String,
    payment_provider_id  UUID,
    invoice_id           String,
    customer_id          String,
    invoice_status       LowCardinality(String),
    invoice_period_end   DateTime('UTC'),
    usage_type           LowCardinality(String),
    amount_cents         Int32,
    period_start         DateTime('UTC'),
    period_end           DateTime('UTC'),
    period_months        UInt32,
    mrr_cents            Int32,
    created_at           DateTime('UTC')
)
ENGINE = ReplacingMergeTree
    ORDER BY (payment_provider_id, line_id)
    SETTINGS index_granularity = 8192;
