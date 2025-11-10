import { EVENT_TYPE } from '@/lib/constants';
import { FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { getFilterQuery } from '@/queries/sql/common';
import { clickhouse, prisma } from '@/lib/prisma';
import { FilterQuery, QueryFilters } from '@/lib/types';

function getEventFilterQuery(filters: QueryFilters = {}, eventType: string): FilterQuery {
  const { eventType: _, ...rest } = filters;
  return getFilterQuery(rest, {
    eventType,
    [FILTER_COLUMNS.eventName]: 'c."eventName"',
    [SESSION_COLUMNS.os]: 's."os"',
    [SESSION_COLUMNS.browser]: 's."browser"',
    [SESSION_COLUMNS.device]: 's."device"',
    [SESSION_COLUMNS.country]: 's."country"',
    [SESSION_COLUMNS.region]: 's."region"',
    [SESSION_COLUMNS.city]: 's."city"',
  });
}

export async function getEventStats(
  websiteId: string,
  filters: QueryFilters = {},
  eventType = EVENT_TYPE.customEvent,
) {
  const { filterQuery, params } = getEventFilterQuery(filters, eventType);

  if (clickhouse.enabled) {
    const { rawQuery, findUnique } = clickhouse;

    const result = await rawQuery(
      `
      select
        count(*) as "count",
        count(distinct "sessionId") as "events"
      from event
      where "websiteId" = {websiteId:UUID}
        and "eventType" = {eventType:String}
        ${filterQuery}`,
      {
        websiteId,
        eventType,
        ...params,
      },
    );

    return findUnique(result);
  }

  // Prisma implementation
  // Extract timezone from filters to ensure consistent timezone usage
  const { timezone = 'utc' } = filters;
  
  // Fix the Prisma raw query syntax
  return prisma.$queryRaw`
    select
      count(*) as count,
      count(distinct "sessionId") as events
    from "WebsiteEvent" e
    join "Session" s on s."id" = e."sessionId"
    where e."websiteId" = ${websiteId}::uuid
      and e."eventType" = ${eventType}
      ${filterQuery}`;
}