import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getWebsiteSession';

export async function getWebsiteSession(...args: [websiteId: string, sessionId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, sessionId: string) {
  const { rawQuery, getTimestampDiffSQL } = prisma;

  return rawQuery(
    `
    select id,
      distinct_id as "distinctId",
      website_id as "websiteId",
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      min(min_time) as "firstAt",
      max(max_time) as "lastAt",
      count(distinct visit_id) as visits,
      sum(views) as views,
      sum(events) as events,
      sum(${getTimestampDiffSQL('min_time', 'max_time')}) as "totaltime" 
    from (select
          session.session_id as id,
          session.distinct_id,
          website_event.visit_id,
          session.website_id,
          session.browser,
          session.os,
          session.device,
          session.screen,
          session.language,
          session.country,
          session.region,
          session.city,
          min(website_event.created_at) as min_time,
          max(website_event.created_at) as max_time,
          sum(case when website_event.event_type = 1 then 1 else 0 end) as views,
          sum(case when website_event.event_type = 2 then 1 else 0 end) as events
    from session
    join website_event on website_event.session_id = session.session_id
    where session.website_id = {{websiteId::uuid}}
      and session.session_id = {{sessionId::uuid}}
    group by session.session_id, session.distinct_id, visit_id, session.website_id, session.browser, session.os, session.device, session.screen, session.language, session.country, session.region, session.city) t
    group by id, distinct_id, website_id, browser, os, device, screen, language, country, region, city;
    `,
    { websiteId, sessionId },
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

async function clickhouseQuery(websiteId: string, sessionId: string) {
  const { rawQuery, getDateStringSQL } = clickhouse;

  return rawQuery(
    `
    select id,
      websiteId,
      distinctId,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      ${getDateStringSQL('min(min_time)')} as firstAt,
      ${getDateStringSQL('max(max_time)')} as lastAt,
      uniq(visit_id) visits,
      sum(views) as views,
      sum(events) as events,
      sum(max_time-min_time) as totaltime
    from (select
              session_id as id,
              distinct_id as distinctId,
              visit_id,
              website_id as websiteId,
              browser,
              os,
              device,
              screen,
              language,
              country,
              region,
              city,
              min(min_time) as min_time,
              max(max_time) as max_time,
              sum(views) as views,
              length(groupArrayArray(event_name)) as events
        from website_event_stats_hourly
        where website_id = {websiteId:UUID}
          and session_id = {sessionId:UUID}
        group by session_id, distinct_id, visit_id, website_id, browser, os, device, screen, language, country, region, city) t
    group by id, websiteId, distinctId, browser, os, device, screen, language, country, region, city;
    `,
    { websiteId, sessionId },
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

async function oceanbaseQuery(websiteId: string, sessionId: string) {
  const { rawQuery, getTimestampDiffSQL } = oceanbase;

  return rawQuery(
    `
    SELECT id,
      distinct_id AS distinctId,
      website_id AS websiteId,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      MIN(min_time) AS firstAt,
      MAX(max_time) AS lastAt,
      COUNT(DISTINCT visit_id) AS visits,
      SUM(views) AS views,
      SUM(events) AS events,
      SUM(${getTimestampDiffSQL('min_time', 'max_time')}) AS totaltime
    FROM (SELECT
          session.session_id AS id,
          session.distinct_id,
          website_event.visit_id,
          session.website_id,
          session.browser,
          session.os,
          session.device,
          session.screen,
          session.language,
          session.country,
          session.region,
          session.city,
          MIN(website_event.created_at) AS min_time,
          MAX(website_event.created_at) AS max_time,
          SUM(CASE WHEN website_event.event_type = 1 THEN 1 ELSE 0 END) AS views,
          SUM(CASE WHEN website_event.event_type = 2 THEN 1 ELSE 0 END) AS events
    FROM session
    JOIN website_event ON website_event.session_id = session.session_id
    WHERE session.website_id = ?
      AND session.session_id = ?
    GROUP BY session.session_id, session.distinct_id, visit_id, session.website_id, session.browser, session.os, session.device, session.screen, session.language, session.country, session.region, session.city) t
    GROUP BY id, distinct_id, website_id, browser, os, device, screen, language, country, region, city;
    `,
    [websiteId, sessionId],
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}
