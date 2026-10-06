import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface GoalParameters {
  startDate: Date;
  endDate: Date;
  /** `path`, `event`, or `order` (a completed commerce payment). */
  type: string;
  /** Path or event name; for `order`, a product ID or `*` for any order. */
  value: string;
}

/** Goal type converting on a completed commerce payment. */
export const ORDER_GOAL_TYPE = 'order';

function getOrderGoalProduct(value: string) {
  const product = value?.trim();

  return product && product !== '*' ? product : undefined;
}

export interface GoalResult {
  num: number;
  total: number;
}

export async function getGoal(
  ...args: [websiteId: string, params: GoalParameters, filters: QueryFilters]
): Promise<GoalResult> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = prisma;

  if (type === ORDER_GOAL_TYPE) {
    return relationalOrderQuery(websiteId, parameters, filters);
  }

  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';

  let operator = '=';
  let paramValue = value;
  if (value.startsWith('*') || value.endsWith('*')) {
    operator = 'like';
    paramValue = value.replace(/^\*|\*$/g, '%');
  }

  const { filterQuery, dateQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value: paramValue,
    startDate,
    endDate,
    eventType,
  });

  const excludeEventTypeFilterQuery = filterQuery
    .split('\n')
    .filter(filter => !filter.includes('event_type'))
    .join('\n')
    .trim();

  return rawQuery(
    `
    select count(distinct website_event.session_id) as num,
    (
      select count(distinct website_event.session_id)
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
      ${dateQuery}
      ${excludeEventTypeFilterQuery}
    ) as total
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and ${column} ${operator} {{value}}
      ${dateQuery}
      ${filterQuery}
    `,
    queryParams,
  ).then(results => results?.[0]);
}

async function clickhouseQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = clickhouse;

  if (type === ORDER_GOAL_TYPE) {
    return clickhouseOrderQuery(websiteId, parameters, filters);
  }

  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';

  let operator = '=';
  let paramValue = value;
  if (value.startsWith('*') || value.endsWith('*')) {
    operator = 'like';
    paramValue = value.replace(/^\*|\*$/g, '%');
  }

  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value: paramValue,
    startDate,
    endDate,
    eventType,
  });

  const excludeEventTypeFilterQuery = filterQuery
    .split('\n')
    .filter(filter => !filter.includes('event_type'))
    .join('\n')
    .trim();

  return rawQuery(
    `
    select count(distinct session_id) as num,
    (
      select count(distinct session_id)
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        ${dateQuery}
        ${excludeEventTypeFilterQuery}
    ) as total
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and ${column} ${operator} {value:String}
      ${dateQuery}
      ${filterQuery}
    `,
    queryParams,
  ).then(results => results?.[0]);
}

// Sessions with a completed payment (optionally containing one product) out of all sessions.
async function relationalOrderQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, value } = parameters;
  const { rawQuery, parseFilters } = prisma;
  const productId = getOrderGoalProduct(value);
  const { filterQuery, dateQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });

  return rawQuery(
    `
    select
      count(distinct case when converted.session_id is not null then website_event.session_id end) as num,
      count(distinct website_event.session_id) as total
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    left join (
      select distinct commerce_event.session_id
      from commerce_event
      where commerce_event.website_id = {{websiteId::uuid}}
        and commerce_event.created_at between {{startDate}} and {{endDate}}
        and commerce_event.order_id is not null
        ${
          productId
            ? `and exists (
          select 1
          from commerce_item
          where commerce_item.commerce_event_id = commerce_event.commerce_event_id
            and commerce_item.product_id = {{productId}}
        )`
            : ''
        }
    ) converted
      on converted.session_id = website_event.session_id
    where website_event.website_id = {{websiteId::uuid}}
      ${dateQuery}
      ${filterQuery}
    `,
    { ...queryParams, productId },
  ).then(results => results?.[0]);
}

async function clickhouseOrderQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, value } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const productId = getOrderGoalProduct(value);
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });

  // Payments are read with FINAL and matched to their current item snapshot.
  return rawQuery(
    `
    with converted as (
      select distinct ce.session_id as session_id
      from (
        select session_id, commerce_event_id, snapshot_id
        from commerce_event final
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and order_id != ''
      ) as ce
      ${
        productId
          ? `inner join (
        select commerce_event_id, snapshot_id
        from commerce_item final
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and product_id = {productId:String}
        group by commerce_event_id, snapshot_id
      ) as ci
        on ci.commerce_event_id = ce.commerce_event_id
       and ci.snapshot_id = ce.snapshot_id`
          : ''
      }
    )
    select
      uniqExactIf(session_id, session_id in (select session_id from converted)) as num,
      uniqExact(session_id) as total
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      ${dateQuery}
      ${filterQuery}
    `,
    { ...queryParams, productId },
  ).then(results => results?.[0]);
}
