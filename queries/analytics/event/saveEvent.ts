import { EVENT_NAME_LENGTH, URL_LENGTH, EVENT_TYPE } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { uuid } from 'lib/crypto';
import { saveEventData } from 'queries/analytics/eventData/saveEventData';

export async function saveEvent(args: {
  sessionId: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  pageTitle?: string;
  eventName?: string;
  eventData?: any;
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
  sessionId: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  pageTitle?: string;
  eventName?: string;
  eventData?: any;
}) {
  const {
    websiteId,
    sessionId,
    urlPath,
    urlQuery,
    referrerPath,
    referrerQuery,
    referrerDomain,
    eventName,
    eventData,
    pageTitle,
  } = data;
  const websiteEventId = uuid();

  const websiteEvent = prisma.client.websiteEvent.create({
    data: {
      id: websiteEventId,
      websiteId,
      sessionId,
      urlPath: urlPath?.substring(0, URL_LENGTH),
      urlQuery: urlQuery?.substring(0, URL_LENGTH),
      referrerPath: referrerPath?.substring(0, URL_LENGTH),
      referrerQuery: referrerQuery?.substring(0, URL_LENGTH),
      referrerDomain: referrerDomain?.substring(0, URL_LENGTH),
      pageTitle,
      eventType: eventName ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
      eventName: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
    },
  });

  if (eventData) {
    await saveEventData({
      websiteId,
      sessionId,
      eventId: websiteEventId,
      urlPath: urlPath?.substring(0, URL_LENGTH),
      eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
      eventData,
    });
  }

  return websiteEvent;
}

async function clickhouseQuery(data: {
  sessionId: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  pageTitle?: string;
  eventName?: string;
  eventData?: any;
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
    sessionId,
    urlPath,
    urlQuery,
    referrerPath,
    referrerQuery,
    referrerDomain,
    pageTitle,
    eventName,
    eventData,
    country,
    subdivision1,
    subdivision2,
    city,
    ...args
  } = data;
  const { getDateFormat, sendMessage } = kafka;
  const eventId = uuid();
  const createdAt = getDateFormat(new Date());

  const message = {
    website_id: websiteId,
    session_id: sessionId,
    event_id: eventId,
    country: country ? country : null,
    subdivision1: country && subdivision1 ? `${country}-${subdivision1}` : null,
    subdivision2: subdivision2 ? subdivision2 : null,
    city: city ? city : null,
    url_path: urlPath?.substring(0, URL_LENGTH),
    url_query: urlQuery?.substring(0, URL_LENGTH),
    referrer_path: referrerPath?.substring(0, URL_LENGTH),
    referrer_query: referrerQuery?.substring(0, URL_LENGTH),
    referrer_domain: referrerDomain?.substring(0, URL_LENGTH),
    page_title: pageTitle,
    event_type: eventName ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
    event_name: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
    created_at: createdAt,
    ...args,
  };

  await sendMessage(message, 'event');

  if (eventData) {
    await saveEventData({
      websiteId,
      sessionId,
      eventId,
      urlPath: urlPath?.substring(0, URL_LENGTH),
      eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
      eventData,
      createdAt,
    });
  }

  return data;
}
