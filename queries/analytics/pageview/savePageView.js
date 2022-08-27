import { CLICKHOUSE, KAFKA, RELATIONAL, URL_LENGTH } from 'lib/constants';
import clickhouse from 'lib/clickhouse';
import { runAnalyticsQuery } from 'lib/db';
import kafka from 'lib/kafka';
import { prisma, runQuery } from 'lib/relational';

export async function savePageView(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
    [KAFKA]: () => kafkaQuery(...args),
  });
}

async function relationalQuery(website_id, { session_id, url, referrer }) {
  return runQuery(
    prisma.pageview.create({
      data: {
        website_id,
        session_id,
        url: url?.substr(0, URL_LENGTH),
        referrer: referrer?.substr(0, URL_LENGTH),
      },
    }),
  );
}

async function clickhouseQuery(website_id, { session_uuid, url, referrer }) {
  const params = [
    website_id,
    session_uuid,
    url?.substr(0, URL_LENGTH),
    referrer?.substr(0, URL_LENGTH),
  ];

  return clickhouse.rawQuery(
    `
    insert into umami.pageview (created_at, website_id, session_uuid, url, referrer)
    values (${clickhouse.getDateFormat(new Date())}, $1, $2, $3, $4);`,
    params,
  );
}

async function kafkaQuery(website_id, { session_uuid, url, referrer }) {
  const params = {
    website_id: website_id,
    session_uuid: session_uuid,
    created_at: kafka.getDateFormat(new Date()),
    url: url?.substr(0, URL_LENGTH),
    referrer: referrer?.substr(0, URL_LENGTH),
  };

  await kafka.sendMessage(params, 'pageview');
}
