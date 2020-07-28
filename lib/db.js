import { PrismaClient } from '@prisma/client';

const options = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
};

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(options);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(options);
  }

  prisma = global.prisma;
}

export default prisma;

prisma.on('query', e => {
  if (process.env.LOG_QUERY) {
    console.log(`${e.params} -> ${e.query} (${e.duration}ms)`);
  }
});

export async function runQuery(query) {
  return query.catch(e => {
    console.error(e);
    throw e;
  });
}

export async function getWebsite(website_uuid) {
  return runQuery(
    prisma.website.findOne({
      where: {
        website_uuid,
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
    }),
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

export async function getSession(session_uuid) {
  return runQuery(
    prisma.session.findOne({
      where: {
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
    ),
  );
}
