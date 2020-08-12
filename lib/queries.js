import moment from 'moment-timezone';

const POSTGRESQL = 'postgresql';
const MYSQL = 'mysql';

export function getDatabase() {
  return process.env.DATABASE_URL.split(':')[0];
}

export function getMetricsQuery(prisma, { website_id, start_at, end_at }) {
  const db = getDatabase();

  if (db === POSTGRESQL) {
    return prisma.$queryRaw(
      `
      select sum(t.c) as "pageviews",
        count(distinct t.session_id) as "uniques",
        sum(case when t.c = 1 then t.c else 0 end) as "bounces",
        sum(t.time) as "totaltime"
      from (
         select session_id,
           date_trunc('hour', created_at),
           count(*) c,
           floor(extract(epoch from max(created_at) - min(created_at))) as "time"
         from pageview
         where website_id=$1
         and created_at between $2 and $3
         group by 1, 2
     ) t
     `,
      website_id,
      start_at,
      end_at,
    );
  }

  if (db === MYSQL) {
    return prisma.$queryRaw(
      `
      select sum(t.c) as "pageviews",
        count(distinct t.session_id) as "uniques",
        sum(case when t.c = 1 then t.c else 0 end) as "bounces",
        sum(t.time) as "totaltime"
      from (
         select session_id,
           date_trunc('hour', created_at),
           count(*) c,
           floor(unix_timestamp(max(created_at)) - unix_timestamp(min(created_at))) as "time"
         from pageview
         where website_id=?
         and created_at between ? and ?
         group by 1, 2
     ) t
     `,
      website_id,
      start_at,
      end_at,
    );
  }

  return Promise.resolve({});
}

export function getPageviewsQuery(prisma, { website_id, start_at, end_at, unit, timezone, count }) {
  const db = getDatabase();

  if (db === POSTGRESQL) {
    return prisma.$queryRaw(
      `
      select date_trunc('${unit}', created_at at time zone '${timezone}') t,
      count(${count}) y
      from pageview
      where website_id=$1
      and created_at between $2 and $3
      group by 1
      order by 1
      `,
      website_id,
      start_at,
      end_at,
    );
  }

  if (db === MYSQL) {
    const tz = moment.tz(timezone).format('Z');
    return prisma.$queryRaw(
      `
      select date_trunc('${unit}', convert_tz(created_at,'+00:00','${tz}')) t,
      count(${count}) y
      from pageview
      where website_id=?
      and created_at between ? and ?
      group by 1
      order by 1
      `,
      website_id,
      start_at,
      end_at,
    );
  }

  return Promise.resolve([]);
}

export function getRankingsQuery(prisma, { website_id, start_at, end_at, type, table }) {
  const db = getDatabase();

  if (db === POSTGRESQL) {
    return prisma.$queryRaw(
      `
      select distinct ${type} x, count(*) y
      from ${table}
      where website_id=$1
      and created_at between $2 and $3
      group by 1
      order by 2 desc
      `,
      website_id,
      start_at,
      end_at,
    );
  }

  if (db === MYSQL) {
    return prisma.$queryRaw(
      `
      select distinct ${type} x, count(*) y
      from ${table}
      where website_id=?
      and created_at between ? and ?
      group by 1
      order by 2 desc
      `,
      website_id,
      start_at,
      end_at,
    );
  }

  return Promise.resolve([]);
}
