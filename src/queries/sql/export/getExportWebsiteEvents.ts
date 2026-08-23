import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export async function getExportWebsiteEvents(websiteId: string, filters: QueryFilters) {
  return runQuery({
    [PRISMA]: () => relationalQuery(websiteId, filters),
    [CLICKHOUSE]: () => clickhouseQuery(websiteId, filters),
  });
}

export async function getExportWebsiteEventsClickhouseStream(websiteId: string, filters: QueryFilters) {
  const { client, parseFilters, connect } = clickhouse;
  await connect();

  const { queryParams, dateQuery, filterQuery } = parseFilters({
    ...filters,
    websiteId,
  });

  const query = `
    select
      website_id,
      session_id,
      visit_id,
      event_id,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      url_path,
      url_query,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer_path,
      referrer_query,
      referrer_domain,
      page_title,
      gclid,
      fbclid,
      msclkid,
      ttclid,
      li_fat_id,
      twclid,
      lcp,
      inp,
      cls,
      fcp,
      ttfb,
      event_type,
      event_name,
      tag,
      distinct_id,
      created_at,
      job_id
    from website_event
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    order by created_at asc
  `;

  const resultSet = await client.query({
    query,
    query_params: queryParams,
    format: 'JSONEachRow',
    clickhouse_settings: {
      date_time_output_format: 'iso',
      output_format_json_quote_64bit_integers: 0,
    },
  });

  return resultSet.stream();
}

async function relationalQuery(websiteId: string, filters: QueryFilters & { cursorDate?: Date; cursorId?: string }) {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, dateQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const hasCursor = filters.cursorDate && filters.cursorId;
  if (hasCursor) {
    (queryParams as any).cursorDate = filters.cursorDate;
    (queryParams as any).cursorId = filters.cursorId;
  }

  return rawQuery(
    `
    select
      website_event.website_id as website_id,
      website_event.session_id as session_id,
      website_event.visit_id as visit_id,
      website_event.event_id as event_id,
      website_event.hostname as hostname,
      session.browser as browser,
      session.os as os,
      session.device as device,
      session.screen as screen,
      session.language as language,
      session.country as country,
      session.region as region,
      session.city as city,
      website_event.url_path as url_path,
      website_event.url_query as url_query,
      website_event.utm_source as utm_source,
      website_event.utm_medium as utm_medium,
      website_event.utm_campaign as utm_campaign,
      website_event.utm_content as utm_content,
      website_event.utm_term as utm_term,
      website_event.referrer_path as referrer_path,
      website_event.referrer_query as referrer_query,
      website_event.referrer_domain as referrer_domain,
      website_event.page_title as page_title,
      website_event.gclid as gclid,
      website_event.fbclid as fbclid,
      website_event.msclkid as msclkid,
      website_event.ttclid as ttclid,
      website_event.li_fat_id as li_fat_id,
      website_event.twclid as twclid,
      website_event.lcp as lcp,
      website_event.inp as inp,
      website_event.cls as cls,
      website_event.fcp as fcp,
      website_event.ttfb as ttfb,
      website_event.event_type as event_type,
      website_event.event_name as event_name,
      website_event.tag as tag,
      session.distinct_id as distinct_id,
      website_event.created_at as created_at,
      null as job_id
    from website_event
    left join session on session.session_id = website_event.session_id
      and session.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
    ${dateQuery}
    ${filterQuery}
    ${
      hasCursor
        ? 'and (website_event.created_at > {{cursorDate::timestamptz}} or (website_event.created_at = {{cursorDate::timestamptz}} and website_event.event_id > {{cursorId::uuid}}))'
        : ''
    }
    order by website_event.created_at asc, website_event.event_id asc
    limit 10000
    `,
    queryParams,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = clickhouse;
  const { queryParams, dateQuery, filterQuery } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      website_id,
      session_id,
      visit_id,
      event_id,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      url_path,
      url_query,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer_path,
      referrer_query,
      referrer_domain,
      page_title,
      gclid,
      fbclid,
      msclkid,
      ttclid,
      li_fat_id,
      twclid,
      lcp,
      inp,
      cls,
      fcp,
      ttfb,
      event_type,
      event_name,
      tag,
      distinct_id,
      created_at,
      job_id
    from website_event
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    order by created_at asc
    `,
    queryParams,
  );
}
