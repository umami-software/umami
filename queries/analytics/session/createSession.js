import { CLICKHOUSE, RELATIONAL, KAFKA } from 'lib/constants';
import {
  getDateFormatClickhouse,
  getDateFormatKafka,
  prisma,
  rawQueryClickhouse,
  runAnalyticsQuery,
  runQuery,
  kafkaProducer,
} from 'lib/db';
import { getSessionByUuid } from 'queries';

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

  await rawQueryClickhouse(
    `insert into umami.session (created_at, session_uuid, website_id, hostname, browser, os, device, screen, language, country)
      values (${getDateFormatClickhouse(new Date())}, $1, $2, $3, $4, $5, $6, $7, $8, $9);`,
    params,
  );

  return getSessionByUuid(session_uuid);
}

async function kafkaQuery(
  website_id,
  { session_uuid, hostname, browser, os, screen, language, country, device },
) {
  const params = {
    session_uuid: session_uuid,
    website_id: website_id,
    created_at: getDateFormatKafka(new Date()),
    hostname: hostname,
    browser: browser,
    os: os,
    device: device,
    screen: screen,
    language: language,
    country: country ? country : null,
  };

  await kafkaProducer(params, 'session');

  return getSessionByUuid(session_uuid);
}
