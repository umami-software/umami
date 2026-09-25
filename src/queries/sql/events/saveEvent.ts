import { v5 } from 'uuid';
import type { Prisma } from '@/generated/prisma/client';
import clickhouse from '@/lib/clickhouse';
import { commerceSchema } from '@/lib/commerce';
import { EVENT_TYPE, FIELD_LENGTH } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';
import { saveCommerceEvent } from '../commerce/saveCommerceEvent';
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
  if (args.eventType !== EVENT_TYPE.customEvent || args.eventData?.commerce === undefined) {
    return runQuery({
      [PRISMA]: () => relationalQuery(args),
      [CLICKHOUSE]: () => clickhouseQuery(args),
    });
  }
  const { commerce: rawCommerce, ...properties } = args.eventData;
  const commerce = commerceSchema.parse(rawCommerce);
  const eventId = commerce.orderId
    ? v5(JSON.stringify(['umami:payment', args.websiteId, commerce.orderId]), v5.URL)
    : uuid();
  const eventArgs = {
    ...args,
    createdAt: args.createdAt ?? new Date(),
    eventName: truncateString(args.eventName, FIELD_LENGTH.eventName),
    eventData: Object.keys(properties).length ? properties : undefined,
  };
  const context = {
    websiteId: args.websiteId,
    sessionId: args.sessionId,
    visitId: args.visitId,
    eventId,
    eventName: eventArgs.eventName,
    createdAt: eventArgs.createdAt,
    data: commerce,
  };
  return runQuery({
    [PRISMA]: () =>
      prisma.transaction(async (tx: Prisma.TransactionClient) => {
        if (await relationalQuery(eventArgs, tx, eventId)) {
          await saveCommerceEvent(context, tx);
        }
      }),
    [CLICKHOUSE]: async () => {
      // Skip completed payment retries. MergeTree cannot guarantee exactly-once
      // generic events across concurrent requests or ambiguous insert failures.
      if (commerce.orderId) {
        const existing = await clickhouse.rawQuery<Array<{ commerce_event_id: string }>>(
          'select commerce_event_id from commerce_event final where website_id = {websiteId:UUID} and commerce_event_id = {eventId:UUID} limit 1',
          { websiteId: args.websiteId, eventId },
        );
        if (existing.length) return;
      }
      // Commerce-associated events go directly to ClickHouse so failures are surfaced.
      await clickhouseQuery(eventArgs, eventId);
      await saveCommerceEvent(context);
    },
  });
}

async function relationalQuery(
  {
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
  }: SaveEventArgs,
  tx?: Prisma.TransactionClient,
  suppliedEventId?: string,
) {
  const websiteEventId = suppliedEventId ?? uuid();

  const row = {
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
  };
  const client = tx ?? prisma.client;
  if (suppliedEventId) {
    const result = await client.websiteEvent.createMany({ data: row, skipDuplicates: true });
    if (!result.count) return false;
  } else {
    await client.websiteEvent.create({ data: row });
  }

  if (eventData) {
    await saveEventData(
      {
        websiteId,
        sessionId,
        eventId: websiteEventId,
        urlPath: truncateString(urlPath, FIELD_LENGTH.url),
        eventName: truncateString(eventName, FIELD_LENGTH.eventName),
        eventData,
        createdAt,
      },
      tx,
    );

    const { revenue, currency } = eventData;

    if (revenue > 0 && currency) {
      await saveRevenue(
        {
          websiteId,
          sessionId,
          eventId: websiteEventId,
          eventName: truncateString(eventName, FIELD_LENGTH.eventName),
          currency,
          revenue,
          createdAt,
        },
        tx,
      );
    }
  }
  return true;
}

async function clickhouseQuery(
  {
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
  }: SaveEventArgs,
  suppliedEventId?: string,
) {
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;
  const eventId = suppliedEventId ?? uuid();

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

  if (kafka.enabled && !suppliedEventId) {
    await sendMessage('event', message);
  } else {
    await insert('website_event', [message]);
  }

  if (eventData) {
    await saveEventData({
      websiteId,
      sessionId,
      eventId,
      direct: !!suppliedEventId,
      urlPath: truncateString(urlPath, FIELD_LENGTH.url),
      eventName: truncateString(eventName, FIELD_LENGTH.eventName),
      eventData,
      createdAt,
    });
  }
}
