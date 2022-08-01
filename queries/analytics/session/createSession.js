import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import {
  getDateFormatClickhouse,
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
  const params = {
    session_uuid: session_uuid,
    website_id: website_id,
    hostname: hostname,
    browser: browser,
    os: os,
    device: device,
    screen: screen,
    language: language,
    country: country ? country : null,
  };

  if (process.env.KAFKA_URL) {
    await kafkaProducer(params, 'session');
  } else {
    const paramsValue = Object.keys(params);

    await rawQueryClickhouse(
      `insert into umami_dev.session (created_at, session_uuid, website_id, hostname, browser, os, device, screen, language, country)
        values (${getDateFormatClickhouse(new Date())}, $1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      paramsValue,
    );
  }

  return getSessionByUuid(session_uuid);
}
