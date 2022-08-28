import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import kafka from 'lib/kafka';
import { runQuery, CLICKHOUSE, KAFKA, PRISMA } from 'lib/db';
import { URL_LENGTH } from 'lib/constants';

export async function savePageView(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
    [KAFKA]: () => kafkaQuery(...args),
  });
}

async function relationalQuery(website_id, { session_id, url, referrer }) {
  return prisma.client.pageview.create({
    data: {
      website_id,
      session_id,
      url: url?.substring(0, URL_LENGTH),
      referrer: referrer?.substring(0, URL_LENGTH),
    },
  });
}

async function clickhouseQuery(website_id, { session_uuid, url, referrer }) {
  const params = [
    website_id,
    session_uuid,
    url?.substring(0, URL_LENGTH),
    referrer?.substring(0, URL_LENGTH),
  ];

  return clickhouse.rawQuery(
    `insert into umami.pageview (created_at, website_id, session_uuid, url, referrer)
    values (${clickhouse.getDateFormat(new Date())}, $1, $2, $3, $4);`,
    params,
  );
}

async function kafkaQuery(website_id, { session_uuid, url, referrer }) {
  const { getDateFormat, sendMessage } = kafka;
  const params = {
    website_id: website_id,
    session_uuid: session_uuid,
    created_at: getDateFormat(new Date()),
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
  };

  await sendMessage(params, 'pageview');
}
