import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { QueryFilters, WebsiteEventData } from 'lib/types';

export async function getEventDataProperties(
  ...args: [websiteId: string, filters: QueryFilters & { propertyName?: string }]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
) {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, params } = await parseFilters(websiteId, filters, {
    columns: { propertyName: 'data_key' },
  });

  return rawQuery(
    `
    select
      data_key as "propertyName",
      count(*) as "total"
    from event_data
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    group by data_key
    order by 2 desc
    limit 500
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
): Promise<{ propertyName: string; dataType: number; propertyValue: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, filters, {
    columns: { propertyName: 'data_key' },
  });

  return rawQuery(
    `
    select
      data_key as propertyName,
      count(*) as total
    from event_data
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${filterQuery}
    group by data_key
    order by 2 desc
    limit 500
    `,
    params,
  ).then(result => {
    return Object.values(result).map((a: any) => {
      return {
        propertyName: a.propertyName,
        dataType: Number(a.dataType),
        propertyValue: a.propertyValue,
        total: Number(a.total),
      };
    });
  });
}
