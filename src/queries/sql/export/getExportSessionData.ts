import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export async function getExportSessionData(websiteId: string, filters: QueryFilters) {
  return runQuery({
    [PRISMA]: () => relationalQuery(websiteId, filters),
    [CLICKHOUSE]: () => clickhouseQuery(websiteId, filters),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { dateQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });
  
  const hasDataDateQuery = dateQuery.replaceAll('website_event.', 'session_data.');

  return rawQuery(
    `
    select
      session_data.website_id as website_id,
      session_data.session_id as session_id,
      session_data.data_key as data_key,
      session_data.string_value as string_value,
      session_data.number_value as number_value,
      session_data.date_value as date_value,
      session_data.data_type as data_type,
      session_data.distinct_id as distinct_id,
      session_data.created_at as created_at,
      null as job_id
    from session_data
    where session_data.website_id = {{websiteId::uuid}}
    ${hasDataDateQuery}
    order by session_data.created_at asc
    `,
    queryParams,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = clickhouse;
  const { queryParams, dateQuery } = parseFilters({
    ...filters,
    websiteId,
  });
  
  const hasDataDateQuery = dateQuery.replaceAll('created_at', 'session_data.created_at');

  return rawQuery(
    `
    select
      website_id,
      session_id,
      data_key,
      string_value,
      number_value,
      date_value,
      data_type,
      distinct_id,
      created_at,
      job_id
    from session_data
    where website_id = {websiteId:UUID}
    ${hasDataDateQuery}
    order by created_at asc
    `,
    queryParams,
  );
}
