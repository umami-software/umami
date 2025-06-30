import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface UTMCriteria {
  startDate: Date;
  endDate: Date;
}

export async function getUTM(...args: [websiteId: string, criteria: UTMCriteria]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, criteria: UTMCriteria) {
  const { startDate, endDate } = criteria;
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, filterParams } = await parseFilters(websiteId, criteria);

  return rawQuery(
    `
    select url_query, count(*) as "num"
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and coalesce(url_query, '') != ''
      and event_type = 1
      ${filterQuery}
    group by 1
    `,
    {
      ...filterParams,
      websiteId,
      startDate,
      endDate,
    },
  ).then(result => parseParameters(result as any[]));
}

async function clickhouseQuery(websiteId: string, criteria: UTMCriteria) {
  const { startDate, endDate } = criteria;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, filterParams } = await parseFilters(websiteId, criteria);

  return rawQuery(
    `
    select url_query, count(*) as "num"
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and url_query != ''
      and event_type = 1
      ${filterQuery}
    group by 1
    `,
    {
      ...filterParams,
      websiteId,
      startDate,
      endDate,
    },
  ).then(result => parseParameters(result as any[]));
}

function parseParameters(data: any[]) {
  return data.reduce((obj, { url_query, num }) => {
    try {
      const searchParams = new URLSearchParams(url_query);

      for (const [key, value] of searchParams) {
        if (key.match(/^utm_(\w+)$/)) {
          const name = value;
          if (!obj[key]) {
            obj[key] = { [name]: Number(num) };
          } else if (!obj[key][name]) {
            obj[key][name] = Number(num);
          } else {
            obj[key][name] += Number(num);
          }
        }
      }
    } catch {
      // Ignore
    }

    return obj;
  }, {});
}
