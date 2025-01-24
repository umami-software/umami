CREATE TABLE umami.website_event_join
(
    session_id UUID,
    visit_id UUID,
    created_at DateTime('UTC')
)
    engine = MergeTree
        ORDER BY (session_id, created_at)
        SETTINGS index_granularity = 8192;

INSERT INTO umami.website_event_join
SELECT DISTINCT
    s.session_id,
    generateUUIDv4() visit_id,
    s.created_at
FROM (SELECT DISTINCT session_id,
        date_trunc('hour', created_at) created_at
    FROM website_event) s;

-- create new table
CREATE TABLE umami.website_event_new
(
    website_id UUID,
    session_id UUID,
    visit_id UUID,
    event_id UUID,
    hostname LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    device LowCardinality(String),
    screen LowCardinality(String),
    language LowCardinality(String),
    country LowCardinality(String),
    subdivision1 LowCardinality(String),
    subdivision2 LowCardinality(String),
    city String,
    url_path String,
    url_query String,
    referrer_path String,
    referrer_query String,
    referrer_domain String,
    page_title String,
    event_type UInt32,
    event_name String,
    created_at DateTime('UTC'),
    job_id UUID
)
    engine = MergeTree
        ORDER BY (website_id, session_id, created_at)
        SETTINGS index_granularity = 8192;

INSERT INTO umami.website_event_new
SELECT we.website_id,
    we.session_id,
    j.visit_id,
    we.event_id,
    we.hostname,
    we.browser,
    we.os,
    we.device,
    we.screen,
    we.language,
    we.country,
    we.subdivision1,
    we.subdivision2,
    we.city,
    we.url_path,
    we.url_query,
    we.referrer_path,
    we.referrer_query,
    we.referrer_domain,
    we.page_title,
    we.event_type,
    we.event_name,
    we.created_at,
    we.job_id
FROM umami.website_event we
JOIN umami.website_event_join j
    ON we.session_id = j.session_id
        and date_trunc('hour', we.created_at) = j.created_at

RENAME TABLE umami.website_event TO umami.website_event_old;
RENAME TABLE umami.website_event_new TO umami.website_event;

/*

 DROP TABLE umami.website_event_old
 DROP TABLE umami.website_event_join

 */