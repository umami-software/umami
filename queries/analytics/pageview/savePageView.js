import { URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function savePageView(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId,
  { pageViewId, session: { id: sessionId }, url, referrer },
) {
  return prisma.client.pageview.create({
    data: {
      id: pageViewId,
      websiteId,
      sessionId,
      url: url?.substring(0, URL_LENGTH),
      referrer: referrer?.substring(0, URL_LENGTH),
    },
  });
}

async function clickhouseQuery(
  websiteId,
  { session: { country, id: sessionId, ...sessionArgs }, url, referrer },
) {
  const website = await redis.get(`website:${websiteId}`);
  const { getDateFormat, sendMessage } = kafka;
  const params = {
    session_id: sessionId,
    website_id: websiteId,
    created_at: getDateFormat(new Date()),
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
    rev_id: website?.revId || 0,
    ...sessionArgs,
    country: country ? country : null,
  };

  await sendMessage(params, 'event');
}
