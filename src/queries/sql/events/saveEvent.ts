import { EVENT_NAME_LENGTH, URL_LENGTH, EVENT_TYPE, PAGE_TITLE_LENGTH } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import clickhouse from '@/lib/clickhouse';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';
import { uuid } from '@/lib/crypto';
import { saveEventData } from './saveEventData';

export async function saveEvent(args: {
  websiteId: string;
  sessionId: string;
  visitId: string;
  urlPath: string;
  urlQuery?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  pageTitle?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  lifatid?: string;
  twclid?: string;
  eventName?: string;
  eventData?: any;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
  region?: string;
  city?: string;
  tag?: string;
  createdAt?: Date;
}) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery(data: {
  websiteId: string;
  sessionId: string;
  visitId: string;
  urlPath: string;
  urlQuery?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  lifatid?: string;
  twclid?: string;
  pageTitle?: string;
  eventName?: string;
  eventData?: any;
  tag?: string;
  hostname?: string;
  createdAt?: Date;
}) {
  const {
    websiteId,
    sessionId,
    visitId,
    urlPath,
    urlQuery,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrerPath,
    referrerQuery,
    referrerDomain,
    eventName,
    eventData,
    pageTitle,
    gclid,
    fbclid,
    msclkid,
    ttclid,
    lifatid,
    twclid,
    tag,
    hostname,
    createdAt,
  } = data;
  const websiteEventId = uuid();

  const websiteEvent = prisma.client.websiteEvent.create({
    data: {
      id: websiteEventId,
      websiteId,
      sessionId,
      visitId,
      urlPath: urlPath?.substring(0, URL_LENGTH),
      urlQuery: urlQuery?.substring(0, URL_LENGTH),
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      referrerPath: referrerPath?.substring(0, URL_LENGTH),
      referrerQuery: referrerQuery?.substring(0, URL_LENGTH),
      referrerDomain: referrerDomain?.substring(0, URL_LENGTH),
      pageTitle: pageTitle?.substring(0, PAGE_TITLE_LENGTH),
      gclid,
      fbclid,
      msclkid,
      ttclid,
      lifatid,
      twclid,
      eventType: eventName ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
      eventName: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
      tag,
      hostname,
      createdAt,
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
      createdAt,
    });
  }

  return websiteEvent;
}

async function clickhouseQuery(data: {
  websiteId: string;
  sessionId: string;
  visitId: string;
  urlPath: string;
  urlQuery?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;
  pageTitle?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  lifatid?: string;
  twclid?: string;
  eventName?: string;
  eventData?: any;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
  region?: string;
  city?: string;
  tag?: string;
  createdAt?: Date;
}) {
  const {
    websiteId,
    sessionId,
    visitId,
    urlPath,
    urlQuery,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrerPath,
    referrerQuery,
    referrerDomain,
    gclid,
    fbclid,
    msclkid,
    ttclid,
    lifatid,
    twclid,
    pageTitle,
    eventName,
    eventData,
    country,
    region,
    city,
    tag,
    createdAt,
    ...args
  } = data;
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;
  const eventId = uuid();

  const message = {
    ...args,
    website_id: websiteId,
    session_id: sessionId,
    visit_id: visitId,
    event_id: eventId,
    country: country,
    region: country && region ? (region.includes('-') ? region : `${country}-${region}`) : null,
    city: city,
    url_path: urlPath?.substring(0, URL_LENGTH),
    url_query: urlQuery?.substring(0, URL_LENGTH),
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm,
    referrer_path: referrerPath?.substring(0, URL_LENGTH),
    referrer_query: referrerQuery?.substring(0, URL_LENGTH),
    referrer_domain: referrerDomain?.substring(0, URL_LENGTH),
    page_title: pageTitle?.substring(0, PAGE_TITLE_LENGTH),
    gclid: gclid,
    fbclid: fbclid,
    msclkid: msclkid,
    ttclid: ttclid,
    li_fat_id: lifatid,
    twclid: twclid,
    event_type: eventName ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
    event_name: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
    tag: tag,
    created_at: getUTCString(createdAt),
  };

  if (kafka.enabled) {
    await sendMessage('event', message);
  } else {
    await insert('website_event', [message]);
  }

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
