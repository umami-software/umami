import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

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
