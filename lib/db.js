import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';
import { getMetricsQuery, getPageviewsQuery, getRankingsQuery } from 'lib/queries';

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
        session_id,
        session_uuid,
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

export async function getAccounts() {
  return runQuery(prisma.account.findMany());
}

export async function getAccount({ user_id, username }) {
  return runQuery(
    prisma.account.findOne({
      where: {
        username,
        user_id,
      },
    }),
  );
}

export async function updateAccount(user_id, data) {
  return runQuery(
    prisma.account.update({
      where: {
        user_id,
      },
      data,
    }),
  );
}

export async function deleteAccount(user_id) {
  return runQuery(
    /* Prisma bug, does not cascade on non-nullable foreign keys
    prisma.account.delete({
      where: {
        user_id,
      },
    }),
     */
    prisma.queryRaw(`delete from account where user_id=$1`, user_id),
  );
}

export async function createAccount(data) {
  return runQuery(
    prisma.account.create({
      data,
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
  return getRankingsQuery(prisma, { website_id, start_at, end_at, type, table });
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
    getPageviewsQuery(prisma, { website_id, start_at, end_at, timezone, unit, count }),
  );
}

export async function getMetrics(website_id, start_at, end_at) {
  return getMetricsQuery(prisma, { website_id, start_at, end_at });
}
