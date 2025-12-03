import { uuid, addSeconds, randomInt } from '../utils.js';
import { getRandomReferrer } from '../distributions/referrers.js';
import type { SessionData } from './sessions.js';

export const EVENT_TYPE = {
  pageView: 1,
  customEvent: 2,
} as const;

export interface PageConfig {
  path: string;
  title: string;
  weight: number;
  avgTimeOnPage: number;
}

export interface CustomEventConfig {
  name: string;
  weight: number;
  pages?: string[];
  data?: Record<string, string[] | number[]>;
}

export interface JourneyConfig {
  pages: string[];
  weight: number;
}

export interface EventData {
  id: string;
  websiteId: string;
  sessionId: string;
  visitId: string;
  eventType: number;
  urlPath: string;
  urlQuery: string | null;
  pageTitle: string | null;
  hostname: string;
  referrerDomain: string | null;
  referrerPath: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  fbclid: string | null;
  eventName: string | null;
  tag: string | null;
  createdAt: Date;
}

export interface EventDataEntry {
  id: string;
  websiteId: string;
  websiteEventId: string;
  dataKey: string;
  stringValue: string | null;
  numberValue: number | null;
  dateValue: Date | null;
  dataType: number;
  createdAt: Date;
}

export interface SiteConfig {
  hostname: string;
  pages: PageConfig[];
  journeys: JourneyConfig[];
  customEvents: CustomEventConfig[];
}

function getPageTitle(pages: PageConfig[], path: string): string | null {
  const page = pages.find(p => p.path === path);
  return page?.title ?? null;
}

function getPageTimeOnPage(pages: PageConfig[], path: string): number {
  const page = pages.find(p => p.path === path);
  return page?.avgTimeOnPage ?? 30;
}

export function generateEventsForSession(
  session: SessionData,
  siteConfig: SiteConfig,
  journey: string[],
): { events: EventData[]; eventDataEntries: EventDataEntry[] } {
  const events: EventData[] = [];
  const eventDataEntries: EventDataEntry[] = [];
  const visitId = uuid();

  let currentTime = session.createdAt;
  const referrer = getRandomReferrer();

  for (let i = 0; i < journey.length; i++) {
    const pagePath = journey[i];
    const isFirstPage = i === 0;

    const eventId = uuid();
    const pageTitle = getPageTitle(siteConfig.pages, pagePath);

    events.push({
      id: eventId,
      websiteId: session.websiteId,
      sessionId: session.id,
      visitId,
      eventType: EVENT_TYPE.pageView,
      urlPath: pagePath,
      urlQuery: null,
      pageTitle,
      hostname: siteConfig.hostname,
      referrerDomain: isFirstPage ? referrer.domain : null,
      referrerPath: isFirstPage ? referrer.path : null,
      utmSource: isFirstPage ? referrer.utmSource : null,
      utmMedium: isFirstPage ? referrer.utmMedium : null,
      utmCampaign: isFirstPage ? referrer.utmCampaign : null,
      utmContent: isFirstPage ? referrer.utmContent : null,
      utmTerm: isFirstPage ? referrer.utmTerm : null,
      gclid: isFirstPage ? referrer.gclid : null,
      fbclid: isFirstPage ? referrer.fbclid : null,
      eventName: null,
      tag: null,
      createdAt: currentTime,
    });

    // Check for custom events on this page
    for (const customEvent of siteConfig.customEvents) {
      // Check if this event can occur on this page
      if (customEvent.pages && !customEvent.pages.includes(pagePath)) {
        continue;
      }

      // Random chance based on weight
      if (Math.random() < customEvent.weight) {
        currentTime = addSeconds(currentTime, randomInt(2, 15));

        const customEventId = uuid();
        events.push({
          id: customEventId,
          websiteId: session.websiteId,
          sessionId: session.id,
          visitId,
          eventType: EVENT_TYPE.customEvent,
          urlPath: pagePath,
          urlQuery: null,
          pageTitle,
          hostname: siteConfig.hostname,
          referrerDomain: null,
          referrerPath: null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          utmContent: null,
          utmTerm: null,
          gclid: null,
          fbclid: null,
          eventName: customEvent.name,
          tag: null,
          createdAt: currentTime,
        });

        // Generate event data if configured
        if (customEvent.data) {
          for (const [key, values] of Object.entries(customEvent.data)) {
            const value = values[Math.floor(Math.random() * values.length)];
            const isNumber = typeof value === 'number';

            eventDataEntries.push({
              id: uuid(),
              websiteId: session.websiteId,
              websiteEventId: customEventId,
              dataKey: key,
              stringValue: isNumber ? null : String(value),
              numberValue: isNumber ? value : null,
              dateValue: null,
              dataType: isNumber ? 2 : 1, // 1 = string, 2 = number
              createdAt: currentTime,
            });
          }
        }
      }
    }

    // Time spent on page before navigating
    const timeOnPage = getPageTimeOnPage(siteConfig.pages, pagePath);
    const variance = Math.floor(timeOnPage * 0.5);
    const actualTime = timeOnPage + randomInt(-variance, variance);
    currentTime = addSeconds(currentTime, Math.max(5, actualTime));
  }

  return { events, eventDataEntries };
}
