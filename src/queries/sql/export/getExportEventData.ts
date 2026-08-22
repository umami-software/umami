import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export async function getExportEventData(websiteId: string, filters: QueryFilters) {
  return runQuery({
    [PRISMA]: () => relationalQuery(websiteId, filters),
    [CLICKHOUSE]: () => clickhouseQuery(websiteId, filters),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, dateQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });
  
  // prisma parseFilters dateQuery replaces 'website_event.created_at' inside it, so we need to alias it or manually replace.
  // Wait, the standard dateQuery for filters usually targets 'website_event.created_at'.
  // In `event_data` table, it's `event_data.created_at`.
  // `parseFilters` defaults to `website_event.created_at`.
  const hasDataDateQuery = dateQuery.replaceAll('website_event.', 'event_data.');
  const hasDataFilterQuery = filterQuery.replaceAll('website_event.', 'event_data.');

  return rawQuery(
    `
    select
      event_data.website_id as website_id,
      website_event.session_id as session_id,
      event_data.website_event_id as event_id,
      website_event.url_path as url_path,
      website_event.event_name as event_name,
      event_data.data_key as data_key,
      event_data.string_value as string_value,
      event_data.number_value as number_value,
      event_data.date_value as date_value,
      event_data.data_type as data_type,
      event_data.created_at as created_at,
      null as job_id
    from event_data
    join website_event on website_event.event_id = event_data.website_event_id
    where event_data.website_id = {{websiteId::uuid}}
    ${hasDataDateQuery}
    order by event_data.created_at asc
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
  
  const hasDataDateQuery = dateQuery.replaceAll('created_at', 'event_data.created_at');

  return rawQuery(
    `
    select
      website_id,
      session_id,
      event_id,
      url_path,
      event_name,
      data_key,
      string_value,
      number_value,
      date_value,
      data_type,
      created_at,
      job_id
    from event_data
    where website_id = {websiteId:UUID}
    ${hasDataDateQuery}
    order by created_at asc
    `,
    queryParams,
  );
}
