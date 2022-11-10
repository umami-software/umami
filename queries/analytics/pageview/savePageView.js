import { URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import cache from 'lib/cache';
import { uuid } from 'lib/crypto';

export async function savePageView(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(data) {
  const { websiteId, sessionId, url, referrer } = data;
  return prisma.client.pageview.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      url: url?.substring(0, URL_LENGTH),
      referrer: referrer?.substring(0, URL_LENGTH),
    },
  });
}

async function clickhouseQuery(data) {
  const { websiteId, id: sessionId, url, referrer, country, ...args } = data;
  const website = await cache.fetchWebsite(websiteId);
  const { getDateFormat, sendMessage } = kafka;

  const msg = {
    session_id: sessionId,
    website_id: websiteId,
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
    rev_id: website?.revId || 0,
    created_at: getDateFormat(new Date()),
    country: country ? country : null,
    ...args,
  };

  await sendMessage(msg, 'event');

  return data;
}
