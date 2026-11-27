import clickhouse from '@/lib/clickhouse';
import { FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { escapeLikeValue } from '@/lib/search';
import type { QueryFilters } from '@/lib/types';

const SESSION_DB_COLUMNS = new Set(
  SESSION_COLUMNS.map(col => FILTER_COLUMNS[col as keyof typeof FILTER_COLUMNS]).filter(Boolean),
);

const FUNCTION_NAME = 'getValues';

export async function getValues(
  ...args: [websiteId: string, column: string, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, column: string, filters: QueryFilters) {
  const { rawQuery, getSearchSQL, parseFilters } = prisma;
  const params = {};
  const { startDate, endDate, search, lockedFilters, timezone } = filters;
  const isSessionColumn = SESSION_DB_COLUMNS.has(column);
  const searchColumn = isSessionColumn ? column : `website_event.${column}`;
  const {
    joinSessionQuery = '',
    filterQuery = '',
    queryParams = {},
  } = lockedFilters
    ? parseFilters({
        lockedFilters,
        startDate,
        endDate,
        timezone,
      })
    : {};

  let searchQuery = '';
  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = `and website_event.referrer_domain != regexp_replace(website_event.hostname, '^www.', '')
      and website_event.referrer_domain != ''`;
  }

  if (search) {
    if (search.includes(',')) {
      searchQuery = `AND (${search
        .split(',')
        .slice(0, 5)
        .map((value: string, index: number) => {
          const key = `search${index}`;

          params[key] = `%${escapeLikeValue(value)}%`;

          return getSearchSQL(searchColumn, key).replace('and ', '');
        })
        .join(' OR ')})`;
    } else {
      searchQuery = getSearchSQL(searchColumn);
    }
  }

  if (isSessionColumn) {
    const lockedSessionFilter = filterQuery
      ? `and session.session_id in (select website_event.session_id from website_event ${joinSessionQuery} where website_event.website_id = {{websiteId::uuid}} and website_event.created_at between {{startDate}} and {{endDate}} ${filterQuery})`
      : '';

    return rawQuery(
      `
      select ${column} as "value", count(*) as "count"
      from session
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
        ${searchQuery}
        ${lockedSessionFilter}
      group by 1
      order by 2 desc
      limit 10
      `,
      {
        websiteId,
        startDate,
        endDate,
        search: `%${escapeLikeValue(search ?? '')}%`,
        ...params,
        ...queryParams,
      },
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select website_event.${column} as "value", count(*) as "count"
    from website_event
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${searchQuery}
      ${excludeDomain}
      ${filterQuery}
    group by 1
    order by 2 desc
    limit 10
    `,
    {
      websiteId,
      startDate,
      endDate,
      search: `%${escapeLikeValue(search ?? '')}%`,
      ...params,
      ...queryParams,
    },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, column: string, filters: QueryFilters) {
  const { rawQuery, getSearchSQL, parseFilters } = clickhouse;
  const params = {};
  const { startDate, endDate, search, lockedFilters, timezone } = filters;
  const { filterQuery = '', queryParams = {} } = lockedFilters
    ? parseFilters({
        lockedFilters,
        startDate,
        endDate,
        timezone,
      })
    : {};

  let searchQuery = '';
  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = `and referrer_domain != hostname and referrer_domain != ''`;
  }

  if (search) {
    if (search.includes(',')) {
      searchQuery = `AND (${search
        .split(',')
        .slice(0, 5)
        .map((value: string, index: number) => {
          const key = `search${index}`;

          params[key] = value;

          return getSearchSQL(column, key).replace('and ', '');
        })
        .join(' OR ')})`;
    } else {
      searchQuery = getSearchSQL(column);
    }
  }

  return rawQuery(
    `
    select ${column} as "value", count(*) as "count"
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${searchQuery}
      ${excludeDomain}
      ${filterQuery}
    group by 1
    order by 2 desc
    limit 10
    `,
    {
      websiteId,
      startDate,
      endDate,
      search,
      ...params,
      ...queryParams,
    },
    FUNCTION_NAME,
  );
}
