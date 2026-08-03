import clickhouse from '@/lib/clickhouse';
import { FIELD_LENGTH } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
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
      urlPath: truncateString(urlPath, FIELD_LENGTH.url),
      urlQuery: truncateString(urlQuery, FIELD_LENGTH.url),
      utmSource: truncateString(utmSource, FIELD_LENGTH.fieldValue),
      utmMedium: truncateString(utmMedium, FIELD_LENGTH.fieldValue),
      utmCampaign: truncateString(utmCampaign, FIELD_LENGTH.fieldValue),
      utmContent: truncateString(utmContent, FIELD_LENGTH.fieldValue),
      utmTerm: truncateString(utmTerm, FIELD_LENGTH.fieldValue),
      referrerPath: truncateString(referrerPath, FIELD_LENGTH.url),
      referrerQuery: truncateString(referrerQuery, FIELD_LENGTH.url),
      referrerDomain: truncateString(referrerDomain, FIELD_LENGTH.url),
      pageTitle: truncateString(pageTitle, FIELD_LENGTH.pageTitle),
      gclid: truncateString(gclid, FIELD_LENGTH.fieldValue),
      fbclid: truncateString(fbclid, FIELD_LENGTH.fieldValue),
      msclkid: truncateString(msclkid, FIELD_LENGTH.fieldValue),
      ttclid: truncateString(ttclid, FIELD_LENGTH.fieldValue),
      lifatid: truncateString(lifatid, FIELD_LENGTH.fieldValue),
      twclid: truncateString(twclid, FIELD_LENGTH.fieldValue),
      eventType,
      eventName: truncateString(eventName, FIELD_LENGTH.eventName) ?? null,
      tag: truncateString(tag, FIELD_LENGTH.tag),
      hostname: truncateString(hostname, FIELD_LENGTH.hostname),
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
      urlPath: truncateString(urlPath, FIELD_LENGTH.url),
      eventName: truncateString(eventName, FIELD_LENGTH.eventName),
      eventData,
      createdAt,
    });

    const { revenue, currency } = eventData;

    if (revenue > 0 && currency) {
      await saveRevenue({
        websiteId,
        sessionId,
        eventId: websiteEventId,
        eventName: truncateString(eventName, FIELD_LENGTH.eventName),
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
    region: truncateString(
      country && region ? (region.includes('-') ? region : `${country}-${region}`) : null,
      FIELD_LENGTH.region,
    ),
    city: truncateString(city, FIELD_LENGTH.city),
    url_path: truncateString(urlPath, FIELD_LENGTH.url),
    url_query: truncateString(urlQuery, FIELD_LENGTH.url),
    utm_source: truncateString(utmSource, FIELD_LENGTH.fieldValue),
    utm_medium: truncateString(utmMedium, FIELD_LENGTH.fieldValue),
    utm_campaign: truncateString(utmCampaign, FIELD_LENGTH.fieldValue),
    utm_content: truncateString(utmContent, FIELD_LENGTH.fieldValue),
    utm_term: truncateString(utmTerm, FIELD_LENGTH.fieldValue),
    referrer_path: truncateString(referrerPath, FIELD_LENGTH.url),
    referrer_query: truncateString(referrerQuery, FIELD_LENGTH.url),
    referrer_domain: truncateString(referrerDomain, FIELD_LENGTH.url),
    page_title: truncateString(pageTitle, FIELD_LENGTH.pageTitle),
    gclid: truncateString(gclid, FIELD_LENGTH.fieldValue),
    fbclid: truncateString(fbclid, FIELD_LENGTH.fieldValue),
    msclkid: truncateString(msclkid, FIELD_LENGTH.fieldValue),
    ttclid: truncateString(ttclid, FIELD_LENGTH.fieldValue),
    li_fat_id: truncateString(lifatid, FIELD_LENGTH.fieldValue),
    twclid: truncateString(twclid, FIELD_LENGTH.fieldValue),
    event_type: eventType,
    event_name: truncateString(eventName, FIELD_LENGTH.eventName) ?? null,
    tag: truncateString(tag, FIELD_LENGTH.tag),
    distinct_id: truncateString(distinctId, FIELD_LENGTH.distinctId),
    created_at: getUTCString(createdAt),
    browser: truncateString(browser, FIELD_LENGTH.browser),
    os: truncateString(os, FIELD_LENGTH.os),
    device: truncateString(device, FIELD_LENGTH.device),
    screen: truncateString(screen, FIELD_LENGTH.screen),
    language: truncateString(language, FIELD_LENGTH.language),
    hostname: truncateString(hostname, FIELD_LENGTH.hostname),
    country: truncateString(country, FIELD_LENGTH.country),
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
      urlPath: truncateString(urlPath, FIELD_LENGTH.url),
      eventName: truncateString(eventName, FIELD_LENGTH.eventName),
      eventData,
      createdAt,
    });
  }
}
