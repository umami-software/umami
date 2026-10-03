import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface BreakdownParameters {
  startDate: Date;
  endDate: Date;
  fields: string[];
  /** When set, adds orders and revenue of completed payments in this currency. */
  currency?: string;
}

export interface BreakdownData {
  views: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  orders?: number;
  revenue?: number;
  [field: string]: string | number;
}

/*
 * Commerce columns are joined per visit: each row receives the orders placed during the
 * visits it contains. A visit that spans several rows (for example several paths)
 * contributes its orders to each of them, as it does to their visitor counts.
 */

export async function getBreakdown(
  ...args: [websiteId: string, parameters: BreakdownParameters, filters: QueryFilters]
): Promise<BreakdownData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: BreakdownParameters,
  filters: QueryFilters,
): Promise<BreakdownData[]> {
  const { getTimestampDiffSQL, parseFilters, rawQuery } = prisma;
  const { startDate, endDate, fields, currency } = parameters;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters(
      {
        ...filters,
        websiteId,
        startDate,
        endDate,
        eventType: EVENT_TYPE.pageView,
      },
      {
        joinSession: !!fields.find((name: string) => SESSION_COLUMNS.includes(name)),
      },
    );
  const needsBounceEvents = filters.excludeBounce !== true;
  const bounceQuery = needsBounceEvents
    ? `sum(case when t.c = 1 and coalesce(e.has_custom_event, 0) = 0 then 1 else 0 end) as "bounces",`
    : '0 as "bounces",';
  const visitEventsJoin = needsBounceEvents
    ? `left join (
      select session_id, visit_id, 1 as "has_custom_event"
      from website_event
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
        and event_type = ${EVENT_TYPE.customEvent}
      group by 1, 2
    ) as e
      on e.session_id = t.session_id
      and e.visit_id = t.visit_id`
    : '';

  const commerceColumns = currency
    ? `coalesce(sum(o.orders), 0) as "orders",
      coalesce(sum(o.revenue), 0) as "revenue",`
    : '';
  const commerceJoin = currency
    ? `left join (
      select commerce_event.session_id, commerce_event.visit_id,
        count(*) as orders,
        sum(commerce_event.total) as revenue
      from commerce_event
      where commerce_event.website_id = {{websiteId::uuid}}
        and commerce_event.created_at between {{startDate}} and {{endDate}}
        and commerce_event.order_id is not null
        and commerce_event.currency = {{breakdownCurrency}}
      group by 1, 2
    ) as o
      on o.session_id = t.session_id
      and o.visit_id = t.visit_id`
    : '';

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      ${bounceQuery}
      ${commerceColumns}
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
      group by ${parseFieldsByName(fields)},
        website_event.session_id, website_event.visit_id
    ) as t
    ${visitEventsJoin}
    ${commerceJoin}
    group by ${parseFieldsByName(fields)}
    order by 2 desc, 1 desc
    limit 500
    `,
    { ...queryParams, breakdownCurrency: currency },
  ).then(rows => normalizeCommerceColumns(rows, currency));
}

function normalizeCommerceColumns(rows: BreakdownData[], currency?: string) {
  if (!currency) {
    return rows;
  }

  return rows.map(row => ({
    ...row,
    orders: Number(row.orders) || 0,
    revenue: Number(row.revenue) || 0,
  }));
}

async function clickhouseQuery(
  websiteId: string,
  parameters: BreakdownParameters,
  filters: QueryFilters,
): Promise<BreakdownData[]> {
  const { parseFilters, rawQuery } = clickhouse;
  const { startDate, endDate, fields, currency } = parameters;

  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    eventType: EVENT_TYPE.pageView,
  });
  const needsBounceEvents = filters.excludeBounce !== true;
  const bounceQuery = needsBounceEvents
    ? `sumIf(1, t.c = 1 and ifNull(e.has_custom_event, 0) = 0) as "bounces",`
    : '0 as "bounces",';
  const visitEventsJoin = needsBounceEvents
    ? `left join (
      select session_id, visit_id, toUInt8(1) as has_custom_event
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = ${EVENT_TYPE.customEvent}
      group by session_id, visit_id
    ) as e using (session_id, visit_id)`
    : '';

  const commerceColumns = currency
    ? `sum(o.visit_orders) as "orders",
      sum(o.visit_revenue) as "revenue",`
    : '';
  // Payments are read with FINAL so retried payments count once.
  const commerceJoin = currency
    ? `left join (
      select session_id, visit_id,
        count() as visit_orders,
        sum(total) as visit_revenue
      from commerce_event final
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and order_id != ''
        and currency = {breakdownCurrency:String}
      group by session_id, visit_id
    ) as o using (session_id, visit_id)`
    : '';

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      ${bounceQuery}
      ${commerceColumns}
      sum(max_time-min_time) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
      group by ${parseFieldsByName(fields)},
        session_id, visit_id
    ) as t
    ${visitEventsJoin}
    ${commerceJoin}
    group by ${parseFieldsByName(fields)}
    order by 2 desc, 1 desc
    limit 500
    `,
    { ...queryParams, breakdownCurrency: currency },
  ).then(rows => normalizeCommerceColumns(rows as BreakdownData[], currency));
}

function parseFields(fields: string[]) {
  return fields.map(name => `${FILTER_COLUMNS[name]} as "${name}"`).join(',');
}

function parseFieldsByName(fields: string[]) {
  return `${fields.map(name => `"${name}"`).join(',')}`;
}
