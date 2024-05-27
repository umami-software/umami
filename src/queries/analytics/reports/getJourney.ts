import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getJourney(
  ...args: [
    websiteId: string,
    filters: {
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
  filters: {
    startDate: Date;
    endDate: Date;
  },
): Promise<
  {
    e1: string;
    e2: string;
    e3: string;
    e4: string;
    e5: string;
    count: string;
  }[]
> {
  const { startDate, endDate } = filters;
  const { rawQuery } = prisma;

  return rawQuery(
    `
    WITH events AS (
      select distinct
          session_id,
          referrer_path,
          COALESCE(event_name, url_path) event,
          ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at) AS event_number
      from website_event 
      where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}
          and referrer_path != url_path), 
    sequences as (
      SELECT s.e1,
            s.e2,
            s.e3,
            s.e4,
            s.e5,
            count(*) count
      FROM (
          SELECT session_id,
              MAX(CASE WHEN event_number = 1 THEN event ELSE NULL END) AS e1,
              MAX(CASE WHEN event_number = 2 THEN event ELSE NULL END) AS e2,
              MAX(CASE WHEN event_number = 3 THEN event ELSE NULL END) AS e3,
              MAX(CASE WHEN event_number = 4 THEN event ELSE NULL END) AS e4,
              MAX(CASE WHEN event_number = 5 THEN event ELSE NULL END) AS e5
          FROM events
          group by session_id) s
      group by s.e1,
            s.e2,
            s.e3,
            s.e4,
            s.e5)
    select *
    from sequences
    order by count desc
    limit 100
    `,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: {
    startDate: Date;
    endDate: Date;
  },
): Promise<
  {
    e1: string;
    e2: string;
    e3: string;
    e4: string;
    e5: string;
    count: string;
  }[]
> {
  const { startDate, endDate } = filters;
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    WITH events AS (
      select distinct
          session_id,
          referrer_path,
          coalesce(nullIf(event_name, ''), url_path) event,
          row_number() OVER (PARTITION BY session_id ORDER BY created_at) AS event_number
      from umami.website_event 
      where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and referrer_path != url_path),
    sequences as (
        SELECT s.e1,
            s.e2,
            s.e3,
            s.e4,
            s.e5,
            count(*) count
        FROM (
          SELECT session_id,
              max(CASE WHEN event_number = 1 THEN event ELSE NULL END) AS e1,
              max(CASE WHEN event_number = 2 THEN event ELSE NULL END) AS e2,
              max(CASE WHEN event_number = 3 THEN event ELSE NULL END) AS e3,
              max(CASE WHEN event_number = 4 THEN event ELSE NULL END) AS e4,
              max(CASE WHEN event_number = 5 THEN event ELSE NULL END) AS e5
          FROM events
          group by session_id) s
        group by s.e1,
            s.e2,
            s.e3,
            s.e4,
            s.e5)
    select *
    from sequences
    order by count desc
    limit 100
    `,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}
