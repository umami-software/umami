-- Create Performance
CREATE TABLE umami.website_performance
(
    website_id UUID,
    session_id UUID,
    visit_id UUID,
    url_path String,
    lcp Nullable(Decimal(10, 1)),
    inp Nullable(Decimal(10, 1)),
    cls Nullable(Decimal(10, 4)),
    fcp Nullable(Decimal(10, 1)),
    ttfb Nullable(Decimal(10, 1)),
    created_at DateTime('UTC')
)
ENGINE = MergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (website_id, toStartOfHour(created_at), session_id)
    SETTINGS index_granularity = 8192;

-- Performance hourly aggregation
CREATE TABLE umami.website_performance_hourly
(
    website_id UUID,
    url_path String,
    lcp_p50 AggregateFunction(quantile(0.5), Nullable(Decimal(10, 1))),
    lcp_p75 AggregateFunction(quantile(0.75), Nullable(Decimal(10, 1))),
    lcp_p95 AggregateFunction(quantile(0.95), Nullable(Decimal(10, 1))),
    inp_p50 AggregateFunction(quantile(0.5), Nullable(Decimal(10, 1))),
    inp_p75 AggregateFunction(quantile(0.75), Nullable(Decimal(10, 1))),
    inp_p95 AggregateFunction(quantile(0.95), Nullable(Decimal(10, 1))),
    cls_p50 AggregateFunction(quantile(0.5), Nullable(Decimal(10, 4))),
    cls_p75 AggregateFunction(quantile(0.75), Nullable(Decimal(10, 4))),
    cls_p95 AggregateFunction(quantile(0.95), Nullable(Decimal(10, 4))),
    fcp_p50 AggregateFunction(quantile(0.5), Nullable(Decimal(10, 1))),
    fcp_p75 AggregateFunction(quantile(0.75), Nullable(Decimal(10, 1))),
    fcp_p95 AggregateFunction(quantile(0.95), Nullable(Decimal(10, 1))),
    ttfb_p50 AggregateFunction(quantile(0.5), Nullable(Decimal(10, 1))),
    ttfb_p75 AggregateFunction(quantile(0.75), Nullable(Decimal(10, 1))),
    ttfb_p95 AggregateFunction(quantile(0.95), Nullable(Decimal(10, 1))),
    sample_count SimpleAggregateFunction(sum, UInt64),
    created_at DateTime('UTC')
)
ENGINE = AggregatingMergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (website_id, toStartOfHour(created_at), url_path)
    SETTINGS index_granularity = 8192;

CREATE MATERIALIZED VIEW umami.website_performance_hourly_mv
TO umami.website_performance_hourly
AS
SELECT
    website_id,
    url_path,
    quantileState(0.5)(lcp) as lcp_p50,
    quantileState(0.75)(lcp) as lcp_p75,
    quantileState(0.95)(lcp) as lcp_p95,
    quantileState(0.5)(inp) as inp_p50,
    quantileState(0.75)(inp) as inp_p75,
    quantileState(0.95)(inp) as inp_p95,
    quantileState(0.5)(cls) as cls_p50,
    quantileState(0.75)(cls) as cls_p75,
    quantileState(0.95)(cls) as cls_p95,
    quantileState(0.5)(fcp) as fcp_p50,
    quantileState(0.75)(fcp) as fcp_p75,
    quantileState(0.95)(fcp) as fcp_p95,
    quantileState(0.5)(ttfb) as ttfb_p50,
    quantileState(0.75)(ttfb) as ttfb_p75,
    quantileState(0.95)(ttfb) as ttfb_p95,
    count() as sample_count,
    toStartOfHour(created_at) as created_at
FROM umami.website_performance
GROUP BY website_id, url_path, toStartOfHour(created_at);
