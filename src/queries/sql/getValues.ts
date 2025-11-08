import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from '@/lib/db';
import { QueryFilters } from '@/lib/types';

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
  const { rawQuery, getSearchSQL } = prisma;
  const params = {};
  const { startDate, endDate, search } = filters;

  let searchQuery = '';
  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = `and website_event.referrer_domain != website_event.hostname
      and website_event.referrer_domain != ''`;
  }

  if (search) {
    if (decodeURIComponent(search).includes(',')) {
      searchQuery = `AND (${decodeURIComponent(search)
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
    inner join session
      on session.session_id = website_event.session_id
        and session.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${searchQuery}
      ${excludeDomain}
    group by 1
    order by 2 desc
    limit 10
    `,
    {
      websiteId,
      startDate,
      endDate,
      search: `%${search}%`,
      ...params,
    },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, column: string, filters: QueryFilters) {
  const { rawQuery, getSearchSQL } = clickhouse;
  const params = {};
  const { startDate, endDate, search } = filters;

  let searchQuery = '';
  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = `and referrer_domain != hostname and referrer_domain != ''`;
  }

  if (search) {
    searchQuery = `and positionCaseInsensitive(${column}, {search:String}) > 0`;
  }

  if (search) {
    if (decodeURIComponent(search).includes(',')) {
      searchQuery = `AND (${decodeURIComponent(search)
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
    },
    FUNCTION_NAME,
  );
}
