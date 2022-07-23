import { CLICKHOUSE, RELATIONAL, URL_LENGTH } from 'lib/constants';
import {
  getDateFormatClickhouse,
  prisma,
  rawQueryClickhouse,
  runAnalyticsQuery,
  runQuery,
} from 'lib/db';

export async function saveEvent(...args) {
  return runAnalyticsQuery({
    [`${RELATIONAL}`]: () => relationalQuery(...args),
    [`${CLICKHOUSE}`]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id, { session_id, url, event_type, event_value }) {
  return runQuery(
    prisma.event.create({
      data: {
        website_id,
        session_id,
        url: url?.substr(0, URL_LENGTH),
        event_type: event_type?.substr(0, 50),
        event_value: event_value?.substr(0, 50),
      },
    }),
  );
}

async function clickhouseQuery(website_id, { session_uuid, url, event_type, event_value }) {
  const params = [
    website_id,
    session_uuid,
    url?.substr(0, URL_LENGTH),
    event_type?.substr(0, 50),
    event_value?.substr(0, 50),
  ];

  return rawQueryClickhouse(
    `
    insert into umami_dev.event (created_at, website_id, session_uuid, url, event_type, event_value)
    values (${getDateFormatClickhouse(new Date())},  $1, $2, $3, $4, $5);`,
    params,
  );
}
