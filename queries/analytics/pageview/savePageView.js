import { URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';

export async function savePageView(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
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
