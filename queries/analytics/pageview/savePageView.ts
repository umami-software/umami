import { URL_LENGTH, EVENT_TYPE } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import cache from 'lib/cache';
import { uuid } from 'lib/crypto';

export async function savePageView(args: {
  id: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  pageTitle?: string;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
  subdivision1?: string;
  subdivision2?: string;
  city?: string;
}) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery(data: {
  id: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  pageTitle?: string;
}) {
  const {
    websiteId,
    id: sessionId,
    urlPath,
    urlQuery,
    referrerPath,
    referrerQuery,
    referrerDomain,
    pageTitle,
  } = data;

  return prisma.client.websiteEvent.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      urlPath: urlPath?.substring(0, URL_LENGTH),
      urlQuery: urlQuery?.substring(0, URL_LENGTH),
      referrerPath: referrerPath?.substring(0, URL_LENGTH),
      referrerQuery: referrerQuery?.substring(0, URL_LENGTH),
      referrerDomain: referrerDomain?.substring(0, URL_LENGTH),
      pageTitle: pageTitle,
      eventType: EVENT_TYPE.pageView,
    },
  });
}

async function clickhouseQuery(data: {
  id: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  pageTitle?: string;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
  subdivision1?: string;
  subdivision2?: string;
  city?: string;
}) {
  const {
    websiteId,
    id: sessionId,
    urlPath,
    urlQuery,
    referrerPath,
    referrerQuery,
    referrerDomain,
    pageTitle,
    country,
    subdivision1,
    subdivision2,
    city,
    ...args
  } = data;
  const { getDateFormat, sendMessage } = kafka;
  const website = await cache.fetchWebsite(websiteId);

  const message = {
    website_id: websiteId,
    session_id: sessionId,
    rev_id: website?.revId || 0,
    country: country ? country : null,
    subdivision1: subdivision1 ? subdivision1 : null,
    subdivision2: subdivision2 ? subdivision2 : null,
    city: city ? city : null,
    urlPath: urlPath?.substring(0, URL_LENGTH),
    urlQuery: urlQuery?.substring(0, URL_LENGTH),
    referrerPath: referrerPath?.substring(0, URL_LENGTH),
    referrerQuery: referrerQuery?.substring(0, URL_LENGTH),
    referrerDomain: referrerDomain?.substring(0, URL_LENGTH),
    page_title: pageTitle,
    event_type: EVENT_TYPE.pageView,
    created_at: getDateFormat(new Date()),
    ...args,
  };

  await sendMessage(message, 'event');

  return data;
}
