import clickhouse from '@/lib/clickhouse';
import {
  CLICK_ID_LENGTH,
  CURRENCY_LENGTH,
  EVENT_NAME_LENGTH,
  HOSTNAME_LENGTH,
  PAGE_TITLE_LENGTH,
  TAG_LENGTH,
  URL_LENGTH,
  UTM_LENGTH,
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
      urlPath: urlPath?.substring(0, URL_LENGTH),
      urlQuery: urlQuery?.substring(0, URL_LENGTH),
      utmSource: utmSource?.substring(0, UTM_LENGTH),
      utmMedium: utmMedium?.substring(0, UTM_LENGTH),
      utmCampaign: utmCampaign?.substring(0, UTM_LENGTH),
      utmContent: utmContent?.substring(0, UTM_LENGTH),
      utmTerm: utmTerm?.substring(0, UTM_LENGTH),
      referrerPath: referrerPath?.substring(0, URL_LENGTH),
      referrerQuery: referrerQuery?.substring(0, URL_LENGTH),
      referrerDomain: referrerDomain?.substring(0, URL_LENGTH),
      pageTitle: pageTitle?.substring(0, PAGE_TITLE_LENGTH),
      gclid: gclid?.substring(0, CLICK_ID_LENGTH),
      fbclid: fbclid?.substring(0, CLICK_ID_LENGTH),
      msclkid: msclkid?.substring(0, CLICK_ID_LENGTH),
      ttclid: ttclid?.substring(0, CLICK_ID_LENGTH),
      lifatid: lifatid?.substring(0, CLICK_ID_LENGTH),
      twclid: twclid?.substring(0, CLICK_ID_LENGTH),
      eventType,
      eventName: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
      tag: tag?.substring(0, TAG_LENGTH),
      hostname: hostname?.substring(0, HOSTNAME_LENGTH),
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
        currency: currency?.substring(0, CURRENCY_LENGTH),
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
    url_path: urlPath?.substring(0, URL_LENGTH),
    url_query: urlQuery?.substring(0, URL_LENGTH),
    utm_source: utmSource?.substring(0, UTM_LENGTH),
    utm_medium: utmMedium?.substring(0, UTM_LENGTH),
    utm_campaign: utmCampaign?.substring(0, UTM_LENGTH),
    utm_content: utmContent?.substring(0, UTM_LENGTH),
    utm_term: utmTerm?.substring(0, UTM_LENGTH),
    referrer_path: referrerPath?.substring(0, URL_LENGTH),
    referrer_query: referrerQuery?.substring(0, URL_LENGTH),
    referrer_domain: referrerDomain?.substring(0, URL_LENGTH),
    page_title: pageTitle?.substring(0, PAGE_TITLE_LENGTH),
    gclid: gclid?.substring(0, CLICK_ID_LENGTH),
    fbclid: fbclid?.substring(0, CLICK_ID_LENGTH),
    msclkid: msclkid?.substring(0, CLICK_ID_LENGTH),
    ttclid: ttclid?.substring(0, CLICK_ID_LENGTH),
    li_fat_id: lifatid?.substring(0, CLICK_ID_LENGTH),
    twclid: twclid?.substring(0, CLICK_ID_LENGTH),
    event_type: eventType,
    event_name: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
    tag: tag?.substring(0, TAG_LENGTH),
    distinct_id: distinctId,
    created_at: getUTCString(createdAt),
    browser: browser,
    os: os,
    device: device,
    screen: screen,
    language: language,
    hostname: hostname?.substring(0, HOSTNAME_LENGTH),
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
      urlPath: urlPath?.substring(0, URL_LENGTH),
      eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
      eventData,
      createdAt,
    });
  }
}
