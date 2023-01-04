-- account
DELETE FROM "user"
WHERE username = 'admin';

INSERT INTO "user"
(user_id, username, password, role, created_at, updated_at, deleted_at)
SELECT account_uuid,
    username,
    password,
    CASE WHEN is_admin = true THEN 'admin' ELSE 'user' END,
    created_at,
    updated_at,
    NULL
FROM v1_account;

-- website
INSERT INTO website
(website_id, name, domain, share_id, rev_id, user_id, team_id, created_at)
SELECT website_uuid,
    name,
    domain,
    share_id,
    0 rev_id,
    a.account_uuid,
    NULL team_id,
    a.created_at
FROM v1_website w
JOIN v1_account a
ON a.user_id = w.user_id;

-- session
INSERT INTO session
(session_id, website_id, hostname, browser, os, device, screen, language, country)
SELECT session_uuid,
    w.website_uuid,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country
FROM v1_session s
JOIN v1_website w
ON w.website_id = s.website_id;

-- pageview
INSERT INTO website_event
(event_id, website_id, session_id, created_at, url, referrer, event_type)
SELECT gen_random_uuid() event_id,
    w.website_uuid,
    s.session_uuid,
    p.created_at,
    p.url,
    p.referrer,
    1 event_type
FROM v1_pageview p
JOIN v1_session s
ON s.session_id = p.session_id
JOIN v1_website w
ON w.website_id = s.website_id;

-- event / event_data
INSERT INTO website_event
(event_id, website_id, session_id, created_at, url, event_type, event_name, event_data)
SELECT e.event_uuid,
    w.website_uuid,
    s.session_uuid,
    e.created_at,
    e.url,
    2 event_type,
    e.event_name,
    ed.event_data
FROM v1_event e
JOIN v1_session s
ON s.session_id = e.session_id
JOIN v1_website w
ON w.website_id = s.website_id
LEFT JOIN v1_event_data ed
ON ed.event_id = e.event_id;