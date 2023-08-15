import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getRetention(
  ...args: [
    websiteId: string,
    dateRange: {
      startDate: Date;
      endDate: Date;
    },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  dateRange: {
    startDate: Date;
    endDate: Date;
  },
): Promise<
  {
    date: string;
    day: number;
    visitors: number;
    returnVisitors: number;
    percentage: number;
  }[]
> {
  const { startDate, endDate } = dateRange;
  const { getDateQuery, getDayDiffQuery, getCastColumnQuery, rawQuery } = prisma;
  const timezone = 'utc';
  const unit = 'day';

  return rawQuery(
    `
    WITH cohort_items AS (
      select session_id,
        ${getDateQuery('created_at', unit, timezone)} as cohort_date  
      from session 
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
    ),
    user_activities AS (
      select distinct
        w.session_id,
        ${getDayDiffQuery(
          getDateQuery('created_at', unit, timezone),
          'c.cohort_date',
        )} as day_number
      from website_event w
      join cohort_items c
      on w.session_id = c.session_id
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
    where c.day_number IN (0,1,2,3,4,5,6,7,14,21,30)
    order by 1, 2`,
    {
      websiteId,
      startDate,
      endDate,
    },
  ).then(results => {
    return results.map(i => ({ ...i, percentage: Number(i.percentage) || 0 }));
  });
}

async function clickhouseQuery(
  websiteId: string,
  dateRange: {
    startDate: Date;
    endDate: Date;
  },
): Promise<
  {
    date: string;
    day: number;
    visitors: number;
    returnVisitors: number;
    percentage: number;
  }[]
> {
  const { startDate, endDate } = dateRange;
  const { getDateQuery, getDateStringQuery, rawQuery } = clickhouse;
  const timezone = 'UTC';
  const unit = 'day';

  return rawQuery(
    `
    WITH cohort_items AS (
      select
        min(${getDateQuery('created_at', unit, timezone)}) as cohort_date,
        session_id
      from website_event
      where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      group by session_id
    ),
    user_activities AS (
      select distinct
        w.session_id,
        (${getDateQuery('created_at', unit, timezone)} - c.cohort_date) / 86400 as day_number
      from website_event w
      join cohort_items c
      on w.session_id = c.session_id
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
      ${getDateStringQuery('c.cohort_date', unit)} as date,
      c.day_number as day,
      s.visitors as visitors,
      c.visitors returnVisitors,
      c.visitors * 100 / s.visitors as percentage
    from cohort_date c
    join cohort_size s
    on c.cohort_date = s.cohort_date
    where c.day_number IN (0,1,2,3,4,5,6,7,14,21,30)
    order by 1, 2`,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}
