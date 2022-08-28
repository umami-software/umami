import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import kafka from 'lib/kafka';
import redis from 'lib/redis';
import { runQuery, CLICKHOUSE, KAFKA, PRISMA } from 'lib/db';

export async function createSession(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
    [KAFKA]: () => kafkaQuery(...args),
  });
}

async function relationalQuery(website_id, data) {
  return prisma.client.session
    .create({
      data: {
        website_id,
        ...data,
      },
      select: {
        session_id: true,
      },
    })
    .then(async res => {
      if (process.env.REDIS_URL) {
        await redis.set(`session:${res.session_uuid}`, '');
      }

      return res;
    });
}

async function clickhouseQuery(
  website_id,
  { session_uuid, hostname, browser, os, screen, language, country, device },
) {
  const params = [
    session_uuid,
    website_id,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country ? country : null,
  ];
  const { rawQuery, getDateFormat } = clickhouse;

  await rawQuery(
    `insert into umami.session (created_at, session_uuid, website_id, hostname, browser, os, device, screen, language, country)
     values (${getDateFormat(new Date())}, $1, $2, $3, $4, $5, $6, $7, $8, $9);`,
    params,
  );
}

async function kafkaQuery(
  website_id,
  { session_uuid, hostname, browser, os, screen, language, country, device },
) {
  const { getDateFormat, sendMessage } = kafka;
  const params = {
    session_uuid: session_uuid,
    website_id: website_id,
    created_at: getDateFormat(new Date()),
    hostname: hostname,
    browser: browser,
    os: os,
    device: device,
    screen: screen,
    language: language,
    country: country ? country : null,
  };

  await sendMessage(params, 'session');

  await redis.set(`session:${session_uuid}`, '');
}
