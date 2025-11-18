import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export interface RetentionParameters {
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export interface RetentionResult {
  date: string;
  day: number;
  visitors: number;
  returnVisitors: number;
  percentage: number;
}

export async function getRetention(
  ...args: [websiteId: string, parameters: RetentionParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: RetentionParameters,
  filters: QueryFilters,
): Promise<RetentionResult[]> {
  const { startDate, endDate, timezone } = parameters;
  const { getDateSQL, getDayDiffQuery, getCastColumnQuery, rawQuery, parseFilters } = prisma;
  const unit = 'day';

  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    timezone,
  });

  return rawQuery(
    `
    WITH cohort_items AS (
      select
        min(${getDateSQL('website_event.created_at', unit, timezone)}) as cohort_date,
        website_event.session_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
      group by website_event.session_id
    ),
    user_activities AS (
      select distinct
        website_event.session_id,
        ${getDayDiffQuery(getDateSQL('created_at', unit, timezone), 'cohort_items.cohort_date')} as day_number
      from website_event
      join cohort_items
      on website_event.session_id = cohort_items.session_id
      where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}
          
      ),
    cohort_size as (
      select cohort_date,
        count(*) as visitors
      from cohort_items
      group by 1
      order by 1
    ),
    cohort_date as (
      select
        c.cohort_date,
        a.day_number,
        count(*) as visitors
      from user_activities a
      join cohort_items c
      on a.session_id = c.session_id
      group by 1, 2
    )
    select
      c.cohort_date as date,
      c.day_number as day,
      s.visitors,
      c.visitors as "returnVisitors",
      ${getCastColumnQuery('c.visitors', 'float')} * 100 / s.visitors  as percentage
    from cohort_date c
    join cohort_size s
    on c.cohort_date = s.cohort_date
    where c.day_number <= 31
    order by 1, 2`,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: RetentionParameters,
  filters: QueryFilters,
): Promise<RetentionResult[]> {
  const { startDate, endDate, timezone } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = clickhouse;
  const unit = 'day';

  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    timezone,
  });

  return rawQuery(
    `
    WITH cohort_items AS (
      select
        min(${getDateSQL('created_at', unit, timezone)}) as cohort_date,
        session_id
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
      group by session_id
    ),
    user_activities AS (
      select distinct
        website_event.session_id,
        toInt32((${getDateSQL('created_at', unit, timezone)} - cohort_items.cohort_date) / 86400) as day_number
      from website_event
      join cohort_items
      on website_event.session_id = cohort_items.session_id
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ),
    cohort_size as (
      select cohort_date,
        count(*) as visitors
      from cohort_items
      group by 1
      order by 1
    ),
    cohort_date as (
      select
        c.cohort_date,
        a.day_number,
        count(*) as visitors
      from user_activities a
      join cohort_items c
      on a.session_id = c.session_id
      group by 1, 2
    )
    select
      c.cohort_date as date,
      c.day_number as day,
      s.visitors as visitors,
      c.visitors returnVisitors,
      c.visitors * 100 / s.visitors as percentage
    from cohort_date c
    join cohort_size s
    on c.cohort_date = s.cohort_date
    where c.day_number <= 31
    order by 1, 2`,
    queryParams,
  );
}
