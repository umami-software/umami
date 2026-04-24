CREATE TABLE IF NOT EXISTS umami.event_data_pivot
(
    website_id      UUID,
    session_id      UUID,
    event_id        UUID,
    event_name      LowCardinality(String),
    url_path        String,
    created_at      DateTime('UTC'),
    property_keys   AggregateFunction(groupArray, String),
    property_values AggregateFunction(groupArray, String),
    property_types  AggregateFunction(groupArray, UInt32)
)
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (website_id, event_name, created_at, event_id)
SETTINGS index_granularity = 8192;

CREATE MATERIALIZED VIEW IF NOT EXISTS umami.event_data_pivot_mv
TO umami.event_data_pivot
AS SELECT
    website_id,
    session_id,
    event_id,
    event_name,
    url_path,
    created_at,
    groupArrayState(data_key) AS property_keys,
    groupArrayState(multiIf(
        data_type IN (1, 3, 5), ifNull(string_value, ''),
        data_type = 2, toString(ifNull(number_value, 0)),
        data_type = 4, toString(ifNull(date_value, toDateTime(0))),
        ''
    )) AS property_values,
    groupArrayState(data_type) AS property_types
FROM umami.event_data
GROUP BY website_id, session_id, event_id, event_name, url_path, created_at;

-- Backfill existing data
INSERT INTO umami.event_data_pivot
SELECT
    website_id,
    session_id,
    event_id,
    event_name,
    url_path,
    created_at,
    groupArrayState(data_key),
    groupArrayState(multiIf(
        data_type IN (1, 3, 5), ifNull(string_value, ''),
        data_type = 2, toString(ifNull(number_value, 0)),
        data_type = 4, toString(ifNull(date_value, toDateTime(0))),
        ''
    )),
    groupArrayState(data_type)
FROM umami.event_data
GROUP BY website_id, session_id, event_id, event_name, url_path, created_at;
