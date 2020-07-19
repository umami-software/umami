import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runQuery(query) {
  return query
    .catch(e => {
      throw e;
    })
    .finally(async () => {
      await prisma.disconnect();
    });
}

export async function getWebsite(website_id) {
  return runQuery(
    prisma.website.findOne({
      where: {
        website_uuid: website_id,
      },
    }),
  );
}

export async function createSession(website_id, session_id, data) {
  await runQuery(
    prisma.session.create({
      data: {
        session_uuid: session_id,
        website: {
          connect: {
            website_uuid: website_id,
          },
        },
        ...data,
      },
    }),
  );
}

export async function getSession(session_id) {
  return runQuery(
    prisma.session.findOne({
      where: {
        session_uuid: session_id,
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
            website_uuid: website_id,
          },
        },
        session: {
          connect: {
            session_uuid: session_id,
          },
        },
        url,
        referrer,
      },
    }),
  );
}

export async function saveEvent(website_id, session_id, url, eventType, eventValue) {
  return runQuery(
    prisma.pageview.create({
      data: {
        website: {
          connect: {
            website_uuid: website_id,
          },
        },
        session: {
          connect: {
            session_uuid: session_id,
          },
        },
        url,
        eventType,
        eventValue,
      },
    }),
  );
}
