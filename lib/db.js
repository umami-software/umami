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
        website_id,
      },
    }),
  );
}

export async function createSession(website_id, session_id, data) {
  await runQuery(
    prisma.session.create({
      data: {
        session_id,
        website: {
          connect: {
            website_id,
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
        session_id,
      },
    }),
  );
}

export async function savePageView(session_id, url, referrer) {
  return runQuery(
    prisma.pageview.create({
      data: {
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
