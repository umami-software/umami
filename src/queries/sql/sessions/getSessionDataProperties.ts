import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { QueryFilters, WebsiteEventData } from '@/lib/types';

export async function getSessionDataProperties(
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
        count(distinct d.session_id) as "total"
    from website_event e
    join session_data d 
        on d.session_id = e.session_id
    where e.website_id = {{websiteId::uuid}}
      and e.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
    group by 1
    order by 2 desc
    limit 500
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
): Promise<{ propertyName: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, filters, {
    columns: { propertyName: 'data_key' },
  });

  return rawQuery(
    `
    select
      data_key as propertyName,
      count(distinct d.session_id) as total
    from website_event e
    join session_data d final
      on d.session_id = e.session_id
    where e.website_id = {websiteId:UUID}
      and e.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and d.data_key != ''
    ${filterQuery}
    group by 1
    order by 2 desc
    limit 500
    `,
    params,
  );
}
