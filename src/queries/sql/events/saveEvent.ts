import clickhouse from '@/lib/clickhouse';
import {
  EVENT_NAME_LENGTH,
  FIELD_VALUE_LENGTH,
  HOSTNAME_LENGTH,
  PAGE_TITLE_LENGTH,
  TAG_LENGTH,
  URL_LENGTH,
} from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
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

  // Performance
  lcp?: number;
  inp?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

export async function saveEvent(args: SaveEventArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

function truncate(value: string | null | undefined, maxLength: number) {
  return value ? value.substring(0, maxLength) : value;
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
  lcp,
  inp,
  cls,
  fcp,
  ttfb,
}: SaveEventArgs) {
  const websiteEventId = uuid();

  await prisma.client.websiteEvent.create({
    data: {
      id: websiteEventId,
      websiteId,
      sessionId,
      visitId,
      urlPath: truncate(urlPath, URL_LENGTH),
      urlQuery: truncate(urlQuery, URL_LENGTH),
      utmSource: truncate(utmSource, FIELD_VALUE_LENGTH),
      utmMedium: truncate(utmMedium, FIELD_VALUE_LENGTH),
      utmCampaign: truncate(utmCampaign, FIELD_VALUE_LENGTH),
      utmContent: truncate(utmContent, FIELD_VALUE_LENGTH),
      utmTerm: truncate(utmTerm, FIELD_VALUE_LENGTH),
      referrerPath: truncate(referrerPath, URL_LENGTH),
      referrerQuery: truncate(referrerQuery, URL_LENGTH),
      referrerDomain: truncate(referrerDomain, URL_LENGTH),
      pageTitle: truncate(pageTitle, PAGE_TITLE_LENGTH),
      gclid: truncate(gclid, FIELD_VALUE_LENGTH),
      fbclid: truncate(fbclid, FIELD_VALUE_LENGTH),
      msclkid: truncate(msclkid, FIELD_VALUE_LENGTH),
      ttclid: truncate(ttclid, FIELD_VALUE_LENGTH),
      lifatid: truncate(lifatid, FIELD_VALUE_LENGTH),
      twclid: truncate(twclid, FIELD_VALUE_LENGTH),
      eventType,
      eventName: truncate(eventName, EVENT_NAME_LENGTH) ?? null,
      tag: truncate(tag, TAG_LENGTH),
      hostname: truncate(hostname, HOSTNAME_LENGTH),
      lcp,
      inp,
      cls,
      fcp,
      ttfb,
      createdAt,
    },
  });

  if (eventData) {
    await saveEventData({
      websiteId,
      sessionId,
      eventId: websiteEventId,
      urlPath: truncate(urlPath, URL_LENGTH),
      eventName: truncate(eventName, EVENT_NAME_LENGTH),
      eventData,
      createdAt,
    });

    const { revenue, currency } = eventData;

    if (revenue > 0 && currency) {
      await saveRevenue({
        websiteId,
        sessionId,
        eventId: websiteEventId,
        eventName: truncate(eventName, EVENT_NAME_LENGTH),
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
  lcp,
  inp,
  cls,
  fcp,
  ttfb,
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
    url_path: truncate(urlPath, URL_LENGTH),
    url_query: truncate(urlQuery, URL_LENGTH),
    utm_source: truncate(utmSource, FIELD_VALUE_LENGTH),
    utm_medium: truncate(utmMedium, FIELD_VALUE_LENGTH),
    utm_campaign: truncate(utmCampaign, FIELD_VALUE_LENGTH),
    utm_content: truncate(utmContent, FIELD_VALUE_LENGTH),
    utm_term: truncate(utmTerm, FIELD_VALUE_LENGTH),
    referrer_path: truncate(referrerPath, URL_LENGTH),
    referrer_query: truncate(referrerQuery, URL_LENGTH),
    referrer_domain: truncate(referrerDomain, URL_LENGTH),
    page_title: truncate(pageTitle, PAGE_TITLE_LENGTH),
    gclid: truncate(gclid, FIELD_VALUE_LENGTH),
    fbclid: truncate(fbclid, FIELD_VALUE_LENGTH),
    msclkid: truncate(msclkid, FIELD_VALUE_LENGTH),
    ttclid: truncate(ttclid, FIELD_VALUE_LENGTH),
    li_fat_id: truncate(lifatid, FIELD_VALUE_LENGTH),
    twclid: truncate(twclid, FIELD_VALUE_LENGTH),
    event_type: eventType,
    event_name: truncate(eventName, EVENT_NAME_LENGTH) ?? null,
    tag: truncate(tag, TAG_LENGTH),
    distinct_id: distinctId,
    created_at: getUTCString(createdAt),
    browser: browser,
    os: os,
    device: device,
    screen: screen,
    language: language,
    hostname: truncate(hostname, HOSTNAME_LENGTH),
    lcp: lcp,
    inp: inp,
    cls: cls,
    fcp: fcp,
    ttfb: ttfb,
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
      urlPath: truncate(urlPath, URL_LENGTH),
      eventName: truncate(eventName, EVENT_NAME_LENGTH),
      eventData,
      createdAt,
    });
  }
}
