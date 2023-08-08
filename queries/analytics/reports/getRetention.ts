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
    date: Date;
    day: number;
    visitors: number;
    returnVisitors: number;
    percentage: number;
  }[]
> {
  const { startDate, endDate } = dateRange;
  const { rawQuery } = prisma;

  return rawQuery(
    `
    WITH cohort_items AS (
      select session_id,
        date_trunc('day', created_at)::date as cohort_date  
      from session 
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
    ),
    user_activities AS (
      select distinct
        w.session_id,
        (date_trunc('day', w.created_at)::date - c.cohort_date::date) as day_number
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
      where a.day_number IN (0,1,2,3,4,5,6,7,14,21,30)
      group by 1, 2
    )
    select
      c.cohort_date as date,
      c.day_number as day,
      s.visitors,
      c.visitors as "returnVisitors",
      c.visitors::float * 100 / s.visitors as percentage
    from cohort_date c
    join cohort_size s
    on c.cohort_date = s.cohort_date
    order by 1, 2`,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}

async function clickhouseQuery(
  websiteId: string,
  dateRange: {
    startDate: Date;
    endDate: Date;
  },
): Promise<
  {
    date: Date;
    day: number;
    visitors: number;
    returnVisitors: number;
    percentage: number;
  }[]
> {
  const { startDate, endDate } = dateRange;
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    WITH cohort_items AS (
      select
        min(date_trunc('day', created_at)) as cohort_date,
        session_id
      from website_event
      where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      group by session_id
    ),
    user_activities AS (
      select distinct
        w.session_id,
        (date_trunc('day', w.created_at) - c.cohort_date) / 86400 as day_number
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
      where a.day_number IN (0,1,2,3,4,5,6,7,14,21,30)
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
    order by 1, 2`,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}
