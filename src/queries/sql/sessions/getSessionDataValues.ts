import clickhouse from '@/lib/clickhouse';
import { DATA_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionDataValues';

export async function getSessionDataValues(
  ...args: [websiteId: string, filters: QueryFilters & { propertyName?: string; dataType?: number }]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string; dataType?: number },
) {
  const { rawQuery, parseFilters, getDateSQL } = prisma;
  const { dataType } = filters;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  if (dataType === DATA_TYPE.array) {
    return rawQuery(
      `
      select
        array_item.value as "value",
        count(distinct session_data.session_id) as "total"
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      join session_data
          on session_data.session_id = website_event.session_id
            and session_data.website_id = website_event.website_id
      cross join lateral jsonb_array_elements_text(coalesce(session_data.string_value, '[]')::jsonb) as array_item(value)
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and session_data.data_key = {{propertyName}}
        and session_data.data_type = ${DATA_TYPE.array}
      ${filterQuery}
      group by array_item.value
      order by 2 desc
      limit 100
      `,
      queryParams,
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select
      case 
        when data_type = 2 then replace(string_value, '.0000', '') 
        when data_type = 4 then ${getDateSQL('date_value', 'hour')} 
        else string_value
      end as "value",
      count(distinct session_data.session_id) as "total"
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    join session_data
        on session_data.session_id = website_event.session_id
          and session_data.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and session_data.data_key = {{propertyName}}
      ${dataType ? `and session_data.data_type = ${dataType}` : ''}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string; dataType?: number },
): Promise<{ propertyName: string; dataType: number; propertyValue: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { dataType } = filters;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  if (dataType === DATA_TYPE.array) {
    return rawQuery(
      `
      select
        arrayJoin(JSONExtract(ifNull(session_data.string_value, '[]'), 'Array(String)')) as "value",
        uniq(session_data.session_id) as "total"
      from website_event
      ${cohortQuery}
      join session_data final
        on session_data.session_id = website_event.session_id
          and session_data.website_id = {websiteId:UUID}
      where website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and session_data.data_key = {propertyName:String}
        and session_data.data_type = ${DATA_TYPE.array}
      ${filterQuery}
      group by value
      order by 2 desc
      limit 100
      `,
      queryParams,
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select
      multiIf(data_type = 2, replaceAll(string_value, '.0000', ''),
              data_type = 4, toString(date_trunc('hour', date_value)),
              string_value) as "value",
      uniq(session_data.session_id) as "total"
    from website_event
    ${cohortQuery}
    join session_data final
      on session_data.session_id = website_event.session_id
        and session_data.website_id = {websiteId:UUID}
    where website_event.website_id = {websiteId:UUID}
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and session_data.data_key = {propertyName:String}
      ${dataType ? `and session_data.data_type = ${dataType}` : ''}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}
