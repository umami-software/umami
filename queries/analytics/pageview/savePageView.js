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

async function relationalQuery({ websiteId }, { session: { id: sessionId }, url, referrer }) {
  return prisma.client.pageview.create({
    data: {
      websiteId,
      sessionId,
      url: url?.substring(0, URL_LENGTH),
      referrer: referrer?.substring(0, URL_LENGTH),
    },
  });
}

async function clickhouseQuery(
  { websiteUuid: websiteId },
  { session: { country, sessionUuid, ...sessionArgs }, url, referrer },
) {
  const { getDateFormat, sendMessage } = kafka;
  const params = {
    session_uuid: sessionUuid,
    website_id: websiteId,
    created_at: getDateFormat(new Date()),
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
    ...sessionArgs,
    country: country ? country : null,
  };

  await sendMessage(params, 'event');
}
