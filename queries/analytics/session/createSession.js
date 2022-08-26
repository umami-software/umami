import { CLICKHOUSE, KAFKA, RELATIONAL } from 'lib/constants';
import { prisma, runQuery } from 'lib/relational';
import clickhouse from 'lib/clickhouse';
import kafka from 'lib/db/kafka';
import { runAnalyticsQuery } from 'lib/db/db';

export async function createSession(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
    [KAFKA]: () => kafkaQuery(...args),
  });
}

async function relationalQuery(website_id, data) {
  return runQuery(
    prisma.session.create({
      data: {
        website_id,
        ...data,
      },
      select: {
        session_id: true,
      },
    }),
  );
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

  await clickhouse.rawQuery(
    `insert into umami.session (created_at, session_uuid, website_id, hostname, browser, os, device, screen, language, country)
      values (${clickhouse.getDateFormat(new Date())}, $1, $2, $3, $4, $5, $6, $7, $8, $9);`,
    params,
  );
}

async function kafkaQuery(
  website_id,
  { session_uuid, hostname, browser, os, screen, language, country, device },
) {
  const params = {
    session_uuid: session_uuid,
    website_id: website_id,
    created_at: kafka.getDateFormat(new Date()),
    hostname: hostname,
    browser: browser,
    os: os,
    device: device,
    screen: screen,
    language: language,
    country: country ? country : null,
  };

  await kafka.sendKafkaMessage(params, 'session');
}
