import { SEED_IDS } from './ids';

/**
 * Deterministic analytics dataset ingested through the real collection
 * endpoints (/api/send, /api/batch, /api/record). Works for both Postgres and
 * ClickHouse. Backdated events use `timestamp` (seconds).
 *
 * IPs are private on purpose: the test image has no GeoLite database and
 * src/lib/detect.ts throws on a non-local IP lookup.
 */

export interface SendPayload {
  type: 'event' | 'identify' | 'performance';
  payload: Record<string, unknown>;
}

export interface RecordPayload {
  type: 'record' | 'heatmap';
  payload: Record<string, unknown>;
}

/** Events sent sequentially, chained with the `x-umami-cache` token. */
export interface Visit {
  events: SendPayload[];
}

export interface Dataset {
  range: { startAt: number; endAt: number };
  visits: Visit[];
  batch: SendPayload[];
  replay: { pageview: SendPayload; record: RecordPayload; heatmap: RecordPayload };
  realtime: SendPayload[];
  expected: { pageviews: number; website2Pageviews: number };
  distinctIds: string[];
  pages: string[];
  eventNames: string[];
}

export interface Persona {
  id: string;
  ip: string;
  userAgent: string;
  screen: string;
  language: string;
  referrer: string;
  utm?: boolean;
  tag?: string;
}

export const HOSTNAME = 'example.test';
export const CURRENCY = 'USD';
export const DAYS = 7;
export const EVENT_NAMES = ['signup', 'purchase', 'download'];
export const UTM_QUERY = 'utm_source=newsletter&utm_medium=email&utm_campaign=launch&gclid=abc123';

/** The first N personas send `identify` calls and carry a distinct id. */
const IDENTIFIED_PERSONAS = 3;
const DAY = 86_400;
const HOUR = 3_600;

export const PAGES = [
  { url: '/', title: 'Home' },
  { url: '/pricing', title: 'Pricing' },
  { url: '/blog/hello-world', title: 'Hello World' },
  { url: '/docs', title: 'Documentation' },
  { url: '/signup', title: 'Sign up' },
];

export const PERSONAS: Persona[] = [
  {
    id: 'alice',
    ip: '10.0.0.1',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    screen: '1920x1080',
    language: 'en-US',
    referrer: 'https://www.google.com/',
    utm: true,
  },
  {
    id: 'bob',
    ip: '10.0.0.2',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    screen: '2560x1440',
    language: 'en-GB',
    referrer: 'https://t.co/abc123',
  },
  {
    id: 'carol',
    ip: '10.0.0.3',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
    screen: '1440x900',
    language: 'de-DE',
    referrer: '',
    tag: 'beta',
  },
  {
    id: 'dave',
    ip: '10.0.0.4',
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    screen: '412x915',
    language: 'fr-FR',
    referrer: 'https://www.bing.com/search?q=umami',
    utm: true,
  },
  {
    id: 'erin',
    ip: '10.0.0.5',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    screen: '390x844',
    language: 'es-ES',
    referrer: '',
  },
  {
    id: 'frank',
    ip: '10.0.0.6',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    screen: '1366x768',
    language: 'en-US',
    referrer: 'https://github.com/umami-software/umami',
  },
];

export function getDistinctId(persona: Persona) {
  return `user-${persona.id}`;
}

function client(persona: Persona) {
  return {
    hostname: HOSTNAME,
    language: persona.language,
    screen: persona.screen,
    userAgent: persona.userAgent,
    ip: persona.ip,
  };
}

function identity(persona: Persona, index: number) {
  return index < IDENTIFIED_PERSONAS ? { id: getDistinctId(persona) } : {};
}

function pageview(
  website: string,
  persona: Persona,
  index: number,
  page: { url: string; title: string },
  extra: Record<string, unknown>,
): SendPayload {
  return {
    type: 'event',
    payload: { website, ...client(persona), ...identity(persona, index), ...page, ...extra },
  };
}

function customEvent(
  website: string,
  persona: Persona,
  index: number,
  name: string,
  data: Record<string, unknown>,
  timestamp: number,
): SendPayload {
  return {
    type: 'event',
    payload: {
      website,
      ...client(persona),
      ...identity(persona, index),
      url: '/',
      title: 'Home',
      name,
      data,
      timestamp,
    },
  };
}

export function buildDataset(now = Date.now()): Dataset {
  const nowSec = Math.floor(now / 1000);
  const range = { startAt: (nowSec - DAYS * DAY) * 1000, endAt: now };
  const visits: Visit[] = [];
  const batch: SendPayload[] = [];
  let pageviews = 0;
  let website2Pageviews = 0;

  // Backdated traffic: days 1..6 ago (today only receives the live events below).
  for (let day = DAYS - 1; day >= 1; day--) {
    PERSONAS.forEach((persona, index) => {
      const start = nowSec - day * DAY - (index + 1) * HOUR;
      const pageCount = 2 + ((day + index) % 3);
      const pages = PAGES.slice(0, pageCount);

      visits.push({
        events: pages.map((page, step) =>
          pageview(SEED_IDS.website, persona, index, page, {
            url: step === 0 && persona.utm ? `${page.url}?${UTM_QUERY}` : page.url,
            referrer: step === 0 && persona.referrer ? persona.referrer : undefined,
            tag: persona.tag,
            timestamp: start + step * 60,
          }),
        ),
      });
      pageviews += pages.length;

      const afterPages = start + pageCount * 60;

      if (day === 2) {
        batch.push(
          customEvent(
            SEED_IDS.website,
            persona,
            index,
            'signup',
            { plan: index % 2 ? 'pro' : 'free', seats: 1 + index },
            afterPages,
          ),
        );
      }

      if (index < IDENTIFIED_PERSONAS && [1, 3, 5].includes(day)) {
        batch.push(
          customEvent(
            SEED_IDS.website,
            persona,
            index,
            'purchase',
            {
              revenue: 49.5 + index * 10,
              currency: CURRENCY,
              quantity: 2,
              items: ['sku-1', 'sku-2'],
              orderedAt: new Date(afterPages * 1000).toISOString(),
              premium: index === 0,
            },
            afterPages + 30,
          ),
        );
      }

      if (day === 4) {
        batch.push(
          customEvent(
            SEED_IDS.website,
            persona,
            index,
            'download',
            { file: 'guide.pdf' },
            afterPages + 60,
          ),
        );
      }

      if (index < IDENTIFIED_PERSONAS && day === DAYS - 1) {
        batch.push({
          type: 'identify',
          payload: {
            website: SEED_IDS.website,
            ...client(persona),
            id: getDistinctId(persona),
            data: {
              plan: 'pro',
              seats: 5 + index,
              tags: ['early-adopter', 'newsletter'],
              signedUpAt: new Date(afterPages * 1000).toISOString(),
              active: true,
            },
            timestamp: afterPages + 90,
          },
        });
      }

      if (day % 2 === 0) {
        batch.push({
          type: 'performance',
          payload: {
            website: SEED_IDS.website,
            ...client(persona),
            url: '/',
            title: 'Home',
            lcp: 1800 + index * 100,
            inp: 120 + index * 10,
            cls: 0.05,
            fcp: 900 + index * 50,
            ttfb: 250 + index * 20,
            timestamp: start + 5,
          },
        });
      }
    });
  }

  // Secondary website (owned by the regular user): two personas, five days.
  for (let day = 5; day >= 1; day--) {
    PERSONAS.slice(0, 2).forEach((persona, index) => {
      const timestamp = nowSec - day * DAY - (index + 1) * HOUR;

      visits.push({
        events: [
          pageview(SEED_IDS.website2, persona, index, PAGES[day % PAGES.length], { timestamp }),
        ],
      });
      website2Pageviews += 1;
    });
  }

  batch.push(
    customEvent(
      SEED_IDS.website2,
      PERSONAS[0],
      0,
      'purchase',
      { revenue: 19.99, currency: CURRENCY, quantity: 1 },
      nowSec - 2 * DAY,
    ),
  );

  // Link clicks and pixel hits (sessions are keyed by the link/pixel id).
  PERSONAS.slice(0, 5).forEach((persona, index) => {
    const timestamp = nowSec - (index + 1) * DAY - 30 * 60;

    batch.push({
      type: 'event',
      payload: { link: SEED_IDS.link, ...client(persona), url: '/', timestamp },
    });
    batch.push({
      type: 'event',
      payload: { pixel: SEED_IDS.pixel, ...client(persona), url: '/', timestamp: timestamp + 60 },
    });
  });

  // Live traffic (no timestamp): one recorded visit plus a few realtime pageviews.
  const replayPersona = PERSONAS[0];
  const replay = {
    pageview: pageview(SEED_IDS.website, replayPersona, 0, PAGES[0], {}),
    record: {
      type: 'record' as const,
      payload: {
        website: SEED_IDS.website,
        events: [
          {
            type: 4,
            data: { href: `https://${HOSTNAME}/`, width: 1280, height: 800 },
            timestamp: now,
          },
          {
            type: 2,
            data: { node: { type: 0, childNodes: [] }, initialOffset: { left: 0, top: 0 } },
            timestamp: now + 10,
          },
          {
            type: 3,
            data: { source: 1, positions: [{ x: 10, y: 20, id: 1, timeOffset: 0 }] },
            timestamp: now + 20,
          },
        ],
      },
    },
    heatmap: {
      type: 'heatmap' as const,
      payload: {
        website: SEED_IDS.website,
        events: [
          {
            type: 'click',
            url: `https://${HOSTNAME}/`,
            x: 100,
            y: 200,
            pageX: 100,
            pageY: 200,
            pageW: 1280,
            pageH: 3000,
            viewportW: 1280,
            viewportH: 800,
            timestamp: now + 30,
          },
          {
            type: 'scroll',
            url: `https://${HOSTNAME}/`,
            scrollPct: 60,
            pageW: 1280,
            pageH: 3000,
            viewportW: 1280,
            viewportH: 800,
            timestamp: now + 40,
          },
        ],
      },
    },
  };
  pageviews += 1;

  const realtime = PERSONAS.slice(1).map((persona, index) =>
    pageview(SEED_IDS.website, persona, index + 1, PAGES[index % PAGES.length], {}),
  );
  pageviews += realtime.length;

  return {
    range,
    visits,
    batch,
    replay,
    realtime,
    expected: { pageviews, website2Pageviews },
    distinctIds: PERSONAS.slice(0, IDENTIFIED_PERSONAS).map(getDistinctId),
    pages: PAGES.map(page => page.url),
    eventNames: EVENT_NAMES,
  };
}
