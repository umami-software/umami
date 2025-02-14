import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { QueryFilters, WebsiteEventData } from '@/lib/types';

export async function getSessionDataValues(
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
  const { rawQuery, parseFilters, getDateSQL } = prisma;
  const { filterQuery, params } = await parseFilters(websiteId, filters);

  return rawQuery(
    `
    select
      case 
        when data_type = 2 then replace(string_value, '.0000', '') 
        when data_type = 4 then ${getDateSQL('date_value', 'hour')} 
        else string_value
      end as "value",
      count(distinct d.session_id) as "total"
    from website_event e
    join session_data d 
        on d.session_id = e.session_id
    where e.website_id = {{websiteId::uuid}}
      and e.created_at between {{startDate}} and {{endDate}}
      and d.data_key = {{propertyName}}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
): Promise<{ propertyName: string; dataType: number; propertyValue: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, filters);

  return rawQuery(
    `
    select
      multiIf(data_type = 2, replaceAll(string_value, '.0000', ''),
              data_type = 4, toString(date_trunc('hour', date_value)),
              string_value) as "value",
      uniq(d.session_id) as "total"
    from website_event e
    join session_data d final
      on d.session_id = e.session_id
    where e.website_id = {websiteId:UUID}
      and e.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and d.data_key = {propertyName:String}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    params,
  );
}
