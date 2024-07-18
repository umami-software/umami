import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { QueryFilters, WebsiteEventData } from 'lib/types';

export async function getEventDataFields(
  ...args: [websiteId: string, filters: QueryFilters & { field?: string }]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters & { field?: string }) {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, params } = await parseFilters(websiteId, filters, {
    columns: { field: 'data_key' },
  });

  return rawQuery(
    `
    select
      data_key as "fieldName",
      data_type as "dataType",
      string_value as "fieldValue",
      count(*) as "total"
    from event_data
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    group by data_key, data_type, string_value
    order by 3 desc, 2 desc, 1 asc
    limit 500
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { field?: string },
): Promise<{ fieldName: string; dataType: number; fieldValue: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, filters, {
    columns: { field: 'data_key' },
  });

  return rawQuery(
    `
    select
      data_key as fieldName,
      data_type as dataType,
      string_value as fieldValue,
      count(*) as total
    from event_data
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${filterQuery}
    group by data_key, data_type, string_value
    order by 3 desc, 2 desc, 1 asc
    limit 500
    `,
    params,
  ).then(result => {
    return Object.values(result).map((a: any) => {
      return {
        fieldName: a.fieldName,
        dataType: Number(a.dataType),
        fieldValue: a.fieldValue,
        total: Number(a.total),
      };
    });
  });
}
