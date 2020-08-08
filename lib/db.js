import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

const options = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
};

function logQuery(e) {
  if (process.env.LOG_QUERY) {
    console.log(chalk.yellow(e.params), '->', e.query, chalk.greenBright(`${e.duration}ms`));
  }
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(options);
  prisma.on('query', logQuery);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(options);
    global.prisma.on('query', logQuery);
  }

  prisma = global.prisma;
}

export default prisma;

export async function runQuery(query) {
  return query.catch(e => {
    console.error(e);
    throw e;
  });
}

export async function getWebsite({ website_id, website_uuid }) {
  return runQuery(
    prisma.website.findOne({
      where: {
        ...(website_id && { website_id }),
        ...(website_uuid && { website_uuid }),
      },
    }),
  );
}

export async function getWebsites(user_id) {
  return runQuery(
    prisma.website.findMany({
      where: {
        user_id,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  );
}

export async function createWebsite(user_id, data) {
  return runQuery(
    prisma.website.create({
      data: {
        account: {
          connect: {
            user_id,
          },
        },
        ...data,
      },
    }),
  );
}

export async function updateWebsite(website_id, data) {
  return runQuery(
    prisma.website.update({
      where: {
        website_id,
      },
      data,
    }),
  );
}

export async function deleteWebsite(website_id) {
  return runQuery(
    /* Prisma bug, does not cascade on non-nullable foreign keys
    prisma.website.delete({
      where: {
        website_id,
      },
    }),
     */
    prisma.queryRaw(`delete from website where website_id=$1`, website_id),
  );
}

export async function createSession(website_id, data) {
  return runQuery(
    prisma.session.create({
      data: {
        website: {
          connect: {
            website_id,
          },
        },
        ...data,
      },
      select: {
        session_id: true,
      },
    }),
  );
}

export async function getSession({ session_id, session_uuid }) {
  return runQuery(
    prisma.session.findOne({
      where: {
        ...(session_id && { session_id }),
        ...(session_uuid && { session_uuid }),
      },
    }),
  );
}

export async function savePageView(website_id, session_id, url, referrer) {
  return runQuery(
    prisma.pageview.create({
      data: {
        website: {
          connect: {
            website_id,
          },
        },
        session: {
          connect: {
            session_id,
          },
        },
        url,
        referrer,
      },
    }),
  );
}

export async function saveEvent(website_id, session_id, url, event_type, event_value) {
  return runQuery(
    prisma.event.create({
      data: {
        website: {
          connect: {
            website_id,
          },
        },
        session: {
          connect: {
            session_id,
          },
        },
        url,
        event_type,
        event_value,
      },
    }),
  );
}

export async function getAccount(username = '') {
  return runQuery(
    prisma.account.findOne({
      where: {
        username,
      },
    }),
  );
}

export async function getPageviews(website_id, start_at, end_at) {
  return runQuery(
    prisma.pageview.findMany({
      where: {
        website_id,
        created_at: {
          gte: start_at,
          lte: end_at,
        },
      },
    }),
  );
}

export async function getRankings(website_id, start_at, end_at, type, table) {
  return runQuery(
    prisma.queryRaw(
      `
      select distinct "${type}" x, count(*) y
      from "${table}"
      where website_id=$1
      and created_at between $2 and $3
      group by 1
      order by 2 desc
      `,
      website_id,
      start_at,
      end_at,
    ),
  );
}

export async function getPageviewData(
  website_id,
  start_at,
  end_at,
  timezone = 'utc',
  unit = 'day',
  count = '*',
) {
  return runQuery(
    prisma.queryRaw(
      `
      select date_trunc('${unit}', created_at at time zone '${timezone}') at time zone '${timezone}' t,
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
    ),
  );
}

export async function getMetrics(website_id, start_at, end_at) {
  return runQuery(
    prisma.queryRaw(
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
         where website_id=${website_id}
         and created_at between '${start_at}' and '${end_at}'
         group by 1, 2
     ) t;
     `,
    ),
  );
}
