import { EVENT_NAME_LENGTH, URL_LENGTH, EVENT_TYPE } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { uuid } from 'lib/crypto';
import { saveEventData } from '../eventData/saveEventData';

export async function saveEvent(args: {
  id: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
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
  id: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
  pageTitle?: string;
  eventName?: string;
  eventData?: any;
}) {
  const { websiteId, id: sessionId, urlPath, urlQuery, eventName, eventData, pageTitle } = data;
  const websiteEventId = uuid();

  const websiteEvent = prisma.client.websiteEvent.create({
    data: {
      id: websiteEventId,
      websiteId,
      sessionId,
      urlPath: urlPath?.substring(0, URL_LENGTH),
      urlQuery: urlQuery?.substring(0, URL_LENGTH),
      pageTitle: pageTitle,
      eventType: EVENT_TYPE.customEvent,
      eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
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
  id: string;
  websiteId: string;
  urlPath: string;
  urlQuery?: string;
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
    id: sessionId,
    urlPath,
    urlQuery,
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
    subdivision1: subdivision1 ? subdivision1 : null,
    subdivision2: subdivision2 ? subdivision2 : null,
    city: city ? city : null,
    url_path: urlPath?.substring(0, URL_LENGTH),
    url_query: urlQuery?.substring(0, URL_LENGTH),
    page_title: pageTitle,
    event_type: EVENT_TYPE.customEvent,
    event_name: eventName?.substring(0, EVENT_NAME_LENGTH),
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
