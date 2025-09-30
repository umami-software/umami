import { uuid } from '@/lib/crypto';
import { EVENT_NAME_LENGTH, URL_LENGTH, PAGE_TITLE_LENGTH } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import clickhouse from '@/lib/clickhouse';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';
import { saveEventData } from './saveEventData';
import { saveRevenue } from './saveRevenue';

export interface SaveEventArgs {
  websiteId: string;
  sessionId: string;
  visitId: string;
  eventType: number;
  createdAt?: Date;

  // Page
  pageTitle?: string;
  hostname?: string;
  urlPath: string;
  urlQuery?: string;
  referrerPath?: string;
  referrerQuery?: string;
  referrerDomain?: string;

  // Session
  distinctId?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
  region?: string;
  city?: string;

  // Events
  eventName?: string;
  eventData?: any;
  tag?: string;

  // UTM
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;

  // Click IDs
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  lifatid?: string;
  twclid?: string;
}

export async function saveEvent(args: SaveEventArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery({
  websiteId,
  sessionId,
  visitId,
  eventType,
  createdAt,
  pageTitle,
  hostname,
  urlPath,
  urlQuery,
  referrerPath,
  referrerQuery,
  referrerDomain,
  eventName,
  eventData,
  tag,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
  utmTerm,
  gclid,
  fbclid,
  msclkid,
  ttclid,
  lifatid,
  twclid,
}: SaveEventArgs) {
  const websiteEventId = uuid();

  await prisma.client.websiteEvent.create({
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
      eventType,
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

    const { revenue, currency } = eventData;

    if (revenue > 0 && currency) {
      await saveRevenue({
        websiteId,
        sessionId,
        eventId: websiteEventId,
        eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
        currency,
        revenue,
        createdAt,
      });
    }
  }
}

async function clickhouseQuery({
  websiteId,
  sessionId,
  visitId,
  eventType,
  createdAt,
  pageTitle,
  hostname,
  urlPath,
  urlQuery,
  referrerPath,
  referrerQuery,
  referrerDomain,
  distinctId,
  browser,
  os,
  device,
  screen,
  language,
  country,
  region,
  city,
  eventName,
  eventData,
  tag,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
  utmTerm,
  gclid,
  fbclid,
  msclkid,
  ttclid,
  lifatid,
  twclid,
}: SaveEventArgs) {
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;
  const eventId = uuid();

  const message = {
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
    event_type: eventType,
    event_name: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
    tag: tag,
    distinct_id: distinctId,
    created_at: getUTCString(createdAt),
    browser,
    os,
    device,
    screen,
    language,
    hostname,
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
}
