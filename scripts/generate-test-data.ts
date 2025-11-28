/* eslint-disable no-console */
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import crypto from 'crypto';
import { startOfMonth, startOfHour, subDays, addHours, addSeconds, startOfDay } from 'date-fns';
import readline from 'readline';

// ============================================================================
// Configuration
// ============================================================================

const SCALES = {
  small: {
    days: 3,
    avgSessionsPerDay: 666, // ~2000 total events
    description: '3 days, ~2,000 events (~2 min)',
  },
  medium: {
    days: 14,
    avgSessionsPerDay: 714, // ~10,000 total events
    description: '14 days, ~10,000 events (~5 min)',
  },
  full: {
    days: 30,
    avgSessionsPerDay: 666, // ~50,000 total events
    description: '30 days, ~50,000 events (~15-20 min)',
  },
};

// Realistic distributions
const GEO_DISTRIBUTION = [
  { country: 'US', region: 'California', city: 'San Francisco', weight: 15 },
  { country: 'US', region: 'New York', city: 'New York', weight: 10 },
  { country: 'US', region: 'Texas', city: 'Austin', weight: 8 },
  { country: 'US', region: 'Washington', city: 'Seattle', weight: 7 },
  { country: 'US', region: 'Florida', city: 'Miami', weight: 5 },
  { country: 'GB', region: 'England', city: 'London', weight: 10 },
  { country: 'GB', region: 'England', city: 'Manchester', weight: 5 },
  { country: 'CA', region: 'Ontario', city: 'Toronto', weight: 6 },
  { country: 'CA', region: 'British Columbia', city: 'Vancouver', weight: 4 },
  { country: 'DE', region: 'Berlin', city: 'Berlin', weight: 5 },
  { country: 'DE', region: 'Bavaria', city: 'Munich', weight: 3 },
  { country: 'IN', region: 'Karnataka', city: 'Bangalore', weight: 4 },
  { country: 'IN', region: 'Maharashtra', city: 'Mumbai', weight: 2 },
  { country: 'FR', region: 'Ile-de-France', city: 'Paris', weight: 5 },
  { country: 'AU', region: 'New South Wales', city: 'Sydney', weight: 3 },
  { country: 'AU', region: 'Victoria', city: 'Melbourne', weight: 1 },
  { country: 'BR', region: 'Sao Paulo', city: 'Sao Paulo', weight: 2 },
  { country: 'JP', region: 'Tokyo', city: 'Tokyo', weight: 2 },
  { country: 'NL', region: 'North Holland', city: 'Amsterdam', weight: 2 },
  { country: 'ES', region: 'Madrid', city: 'Madrid', weight: 1 },
];

const BROWSERS = [
  { name: 'Chrome', weight: 50 },
  { name: 'Safari', weight: 25 },
  { name: 'Firefox', weight: 12 },
  { name: 'Edge', weight: 10 },
  { name: 'Opera', weight: 2 },
  { name: 'Brave', weight: 1 },
];

const OS_DISTRIBUTION = [
  { name: 'Windows', version: '10', weight: 30 },
  { name: 'Windows', version: '11', weight: 10 },
  { name: 'Mac OS', version: '14.0', weight: 15 },
  { name: 'Mac OS', version: '13.0', weight: 10 },
  { name: 'iOS', version: '17.0', weight: 10 },
  { name: 'iOS', version: '16.0', weight: 8 },
  { name: 'Android', version: '14', weight: 7 },
  { name: 'Android', version: '13', weight: 5 },
  { name: 'Linux', version: 'Ubuntu', weight: 4 },
  { name: 'Linux', version: 'Fedora', weight: 1 },
];

const DEVICES = [
  { type: 'desktop', screen: '1920x1080', weight: 35 },
  { type: 'desktop', screen: '1366x768', weight: 15 },
  { type: 'desktop', screen: '1440x900', weight: 10 },
  { type: 'desktop', screen: '2560x1440', weight: 5 },
  { type: 'mobile', screen: '375x667', weight: 10 },
  { type: 'mobile', screen: '414x896', weight: 10 },
  { type: 'mobile', screen: '390x844', weight: 8 },
  { type: 'tablet', screen: '768x1024', weight: 4 },
  { type: 'tablet', screen: '820x1180', weight: 3 },
];

const LANGUAGES = [
  { code: 'en-US', weight: 50 },
  { code: 'en-GB', weight: 15 },
  { code: 'en-CA', weight: 5 },
  { code: 'de-DE', weight: 8 },
  { code: 'fr-FR', weight: 5 },
  { code: 'es-ES', weight: 4 },
  { code: 'pt-BR', weight: 3 },
  { code: 'ja-JP', weight: 2 },
  { code: 'zh-CN', weight: 3 },
  { code: 'hi-IN', weight: 3 },
  { code: 'nl-NL', weight: 2 },
];

const PAGES = [
  { path: '/', title: 'Hulu - Stream TV and Movies', weight: 30, isEntry: true },
  { path: '/welcome', title: 'Welcome to Hulu', weight: 15, isEntry: true },
  { path: '/plans', title: 'Plans - Hulu', weight: 12, isEntry: true },
  { path: '/browse', title: 'Browse - Hulu', weight: 18, isEntry: true },
  { path: '/browse/movies', title: 'Movies - Hulu', weight: 10, isEntry: false },
  { path: '/browse/tv-shows', title: 'TV Shows - Hulu', weight: 12, isEntry: false },
  { path: '/browse/originals', title: 'Hulu Originals', weight: 8, isEntry: false },
  { path: '/browse/sports', title: 'Sports - Hulu', weight: 6, isEntry: false },
  { path: '/watch/the-bear', title: 'The Bear - Hulu', weight: 8, isEntry: true },
  { path: '/watch/shogun', title: 'Shogun - Hulu', weight: 7, isEntry: true },
  { path: '/watch/abbott-elementary', title: 'Abbott Elementary - Hulu', weight: 6, isEntry: true },
  {
    path: '/watch/the-handmaids-tale',
    title: "The Handmaid's Tale - Hulu",
    weight: 5,
    isEntry: true,
  },
  { path: '/watch/futurama', title: 'Futurama - Hulu', weight: 4, isEntry: true },
  { path: '/watch/greys-anatomy', title: "Grey's Anatomy - Hulu", weight: 4, isEntry: false },
  { path: '/my-stuff', title: 'My Stuff - Hulu', weight: 5, isEntry: false },
  { path: '/search', title: 'Search - Hulu', weight: 4, isEntry: false },
  { path: '/account', title: 'Account - Hulu', weight: 3, isEntry: false },
  { path: '/signup', title: 'Sign Up - Hulu', weight: 8, isEntry: false },
  { path: '/subscribe', title: 'Subscribe - Hulu', weight: 4, isEntry: false },
];

const REFERRERS = [
  { type: 'direct', domain: '', weight: 30 },
  // Search engines
  { type: 'search', domain: 'google.com', weight: 25 },
  { type: 'search', domain: 'bing.com', weight: 4 },
  { type: 'search', domain: 'yahoo.com', weight: 2 },
  { type: 'search', domain: 'duckduckgo.com', weight: 1 },
  // Social media
  { type: 'social', domain: 'facebook.com', weight: 8 },
  { type: 'social', domain: 'twitter.com', weight: 4 },
  { type: 'social', domain: 'instagram.com', weight: 3 },
  { type: 'social', domain: 'tiktok.com', weight: 3 },
  { type: 'social', domain: 'reddit.com', weight: 2 },
  { type: 'social', domain: 'youtube.com', weight: 2 },
  // Review & comparison sites
  { type: 'referral', domain: 'cnet.com', weight: 2 },
  { type: 'referral', domain: 'techradar.com', weight: 1 },
  { type: 'referral', domain: 'tomsguide.com', weight: 1 },
  { type: 'referral', domain: 'pcmag.com', weight: 1 },
  { type: 'referral', domain: 'theverge.com', weight: 1 },
  // Entertainment news
  { type: 'referral', domain: 'ew.com', weight: 1 },
  { type: 'referral', domain: 'variety.com', weight: 1 },
  { type: 'referral', domain: 'deadline.com', weight: 1 },
  { type: 'referral', domain: 'tvline.com', weight: 1 },
  // Deal sites
  { type: 'referral', domain: 'slickdeals.net', weight: 2 },
  { type: 'referral', domain: 'retailmenot.com', weight: 1 },
  // Aggregators
  { type: 'referral', domain: 'justwatch.com', weight: 2 },
  { type: 'referral', domain: 'reelgood.com', weight: 1 },
];

const UTM_CAMPAIGNS = [
  {
    source: 'google',
    medium: 'cpc',
    campaign: 'streaming_2025',
    content: ['ad_variant_1', 'ad_variant_2'],
    term: ['stream tv', 'watch movies online', 'hulu subscription'],
    weight: 40,
  },
  {
    source: 'facebook',
    medium: 'social',
    campaign: 'new_shows_promo',
    content: ['the_bear', 'shogun'],
    term: null,
    weight: 30,
  },
  {
    source: 'newsletter',
    medium: 'email',
    campaign: 'new_releases',
    content: null,
    term: null,
    weight: 20,
  },
  {
    source: 'tiktok',
    medium: 'social',
    campaign: 'viral_clips',
    content: null,
    term: null,
    weight: 10,
  },
];

const CUSTOM_EVENTS = [
  { name: 'click_start_trial', frequency: 0.4 }, // 40% of homepage visits
  { name: 'click_subscribe', frequency: 0.3 }, // 30% of plans page visits
  { name: 'play_video', frequency: 0.5 }, // Video plays
  { name: 'add_to_my_stuff', frequency: 0.25 },
  { name: 'search_content', frequency: 0.3 },
  { name: 'share_show', frequency: 0.08 },
  { name: 'complete_episode', frequency: 0.35 },
  { name: 'pause_video', frequency: 0.4 },
];

// ============================================================================
// Utility Functions
// ============================================================================

function hash(...args) {
  return crypto.createHash('sha512').update(args.join('')).digest('hex');
}

function generateSessionId(websiteId, ip, userAgent, createdAt) {
  const sessionSalt = hash(startOfMonth(createdAt).toUTCString());
  return uuidv5(hash(websiteId, ip, userAgent, sessionSalt), uuidv5.DNS);
}

function generateVisitId(websiteId, sessionId, createdAt) {
  const visitSalt = hash(startOfHour(createdAt).toUTCString());
  return uuidv5(hash(websiteId, sessionId, visitSalt), uuidv5.DNS);
}

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomIP() {
  return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`;
}

function generateUserAgent(browser, os, device) {
  const deviceString = device === 'mobile' ? 'Mobile' : device === 'tablet' ? 'Tablet' : '';
  return `Mozilla/5.0 (${os}${deviceString ? '; ' + deviceString : ''}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser} Safari/537.36`;
}

function getHourlyMultiplier(hour) {
  // Traffic pattern: low 0-9, ramp 9-12, peak 12-20, decline 20-24 (UTC)
  if (hour >= 0 && hour < 9) return 0.3;
  if (hour >= 9 && hour < 12) return 0.8;
  if (hour >= 12 && hour < 20) return 1.4;
  return 0.6;
}

function getWeekdayMultiplier(dayOfWeek) {
  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) return 0.5; // Weekend
  if (dayOfWeek === 5) return 0.8; // Friday
  return 1.0; // Monday-Thursday
}

function getWeekMultiplier(weekNum, totalWeeks) {
  // Week 1: 90%, Week 2-3: 100%, Week 4+: 110%
  if (weekNum === 0) return 0.9;
  if (weekNum >= totalWeeks - 1) return 1.1;
  return 1.0;
}

function shouldBounce(pagePath) {
  // Blog posts have higher bounce rate
  if (pagePath.startsWith('/blog/')) return Math.random() < 0.65;
  if (pagePath === '/') return Math.random() < 0.45;
  if (pagePath === '/pricing') return Math.random() < 0.35;
  return Math.random() < 0.48;
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

// ============================================================================
// Data Generation
// ============================================================================

function generateSession(websiteId, timestamp) {
  const geo = weightedRandom(GEO_DISTRIBUTION);
  const browser = weightedRandom(BROWSERS);
  const os = weightedRandom(OS_DISTRIBUTION);
  const device = weightedRandom(DEVICES);
  const language = weightedRandom(LANGUAGES);

  const ip = randomIP();
  const userAgent = generateUserAgent(browser.name, os.name, device.type);

  const sessionId = generateSessionId(websiteId, ip, userAgent, timestamp);

  return {
    id: sessionId,
    websiteId,
    browser: browser.name,
    os: `${os.name} ${os.version}`,
    device: device.type,
    screen: device.screen,
    language: language.code,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    createdAt: timestamp,
  };
}

function generateUserJourney(session, websiteId, startTime) {
  const events = [];
  const visitId = generateVisitId(websiteId, session.id, startTime);

  // Determine entry page
  const entryPages = PAGES.filter(p => p.isEntry);
  let currentPage = weightedRandom(entryPages);

  // Determine referrer
  const referrer = weightedRandom(REFERRERS);
  let referrerDomain = referrer.domain;
  let referrerPath = '';
  let urlQuery = '';

  // 8% of traffic has UTM parameters
  const hasUTM = Math.random() < 0.08;
  if (hasUTM) {
    const campaign = weightedRandom(UTM_CAMPAIGNS);
    const params = [
      `utm_source=${campaign.source}`,
      `utm_medium=${campaign.medium}`,
      `utm_campaign=${campaign.campaign}`,
    ];

    if (campaign.content) {
      const content = campaign.content[randomInt(0, campaign.content.length - 1)];
      params.push(`utm_content=${content}`);
    }
    if (campaign.term) {
      const term = campaign.term[randomInt(0, campaign.term.length - 1)];
      params.push(`utm_term=${encodeURIComponent(term)}`);
    }

    urlQuery = params.join('&');
    referrerDomain = 'google.com'; // Most UTM traffic from paid search
  } else if (referrer.type === 'search') {
    referrerPath = '/search';
    urlQuery =
      'q=' +
      encodeURIComponent(
        [
          'hulu',
          'hulu free trial',
          'stream tv online',
          'watch movies online',
          'the bear hulu',
          'hulu subscription',
          'hulu vs netflix',
          'best streaming service',
          'hulu plans',
          'shogun where to watch',
        ][randomInt(0, 9)],
      );
  } else if (referrer.type === 'social') {
    // Different paths for different social platforms
    if (referrer.domain === 'reddit.com') {
      referrerPath = ['/r/cordcutters', '/r/television', '/r/Hulu', '/r/streaming'][
        randomInt(0, 3)
      ];
    } else if (referrer.domain === 'youtube.com') {
      referrerPath = '/watch?v=' + Math.random().toString(36).substring(2, 13);
    } else if (referrer.domain === 'tiktok.com') {
      referrerPath = '/@hulureviews/video/' + randomInt(1000000, 9999999);
    } else {
      referrerPath = '/posts/' + randomInt(100000, 999999);
    }
  } else if (referrer.type === 'referral') {
    // Different paths for different referral sites
    if (referrer.domain === 'justwatch.com' || referrer.domain === 'reelgood.com') {
      referrerPath = ['/us/provider/hulu', '/us/movie/the-bear', '/us/tv-show/shogun'][
        randomInt(0, 2)
      ];
    } else if (referrer.domain.includes('slickdeals') || referrer.domain.includes('retailmenot')) {
      referrerPath = '/coupons/hulu';
    } else {
      // News/review sites - article paths
      referrerPath =
        '/streaming/' +
        [
          'hulu-review',
          'best-streaming-services-2025',
          'hulu-vs-netflix',
          'the-bear-season-3-review',
        ][randomInt(0, 3)];
    }
  }

  let currentTime = new Date(startTime);

  // Parse UTM parameters if present
  let utmParams = {};
  if (urlQuery && urlQuery.includes('utm_')) {
    const params = new URLSearchParams(urlQuery);
    utmParams = {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      utmContent: params.get('utm_content'),
      utmTerm: params.get('utm_term'),
    };
  }

  // First pageview (entry)
  events.push({
    id: uuidv4(),
    websiteId,
    sessionId: session.id,
    visitId,
    urlPath: currentPage.path,
    urlQuery: urlQuery || null,
    referrerDomain: referrerDomain || null,
    referrerPath: referrerPath || null,
    pageTitle: currentPage.title,
    eventType: 1, // pageview
    eventName: null,
    hostname: 'hulu.com',
    ...utmParams,
    createdAt: currentTime,
  });

  // Check if bounce
  if (shouldBounce(currentPage.path)) {
    return events; // Single page visit
  }

  // Generate custom event for entry page
  const entryEvent = CUSTOM_EVENTS.find(e => {
    if (currentPage.path === '/' && e.name === 'click_start_trial') return true;
    if (currentPage.path === '/plans' && e.name === 'click_subscribe') return true;
    if (currentPage.path.startsWith('/watch/') && e.name === 'play_video') return true;
    return false;
  });

  if (entryEvent && Math.random() < entryEvent.frequency) {
    currentTime = addSeconds(currentTime, randomInt(60, 180)); // 1-3 minutes later

    events.push({
      id: uuidv4(),
      websiteId,
      sessionId: session.id,
      visitId,
      urlPath: currentPage.path,
      urlQuery: null,
      referrerDomain: null,
      referrerPath: null,
      pageTitle: null,
      eventType: 2, // custom event
      eventName: entryEvent.name,
      hostname: 'hulu.com',
      createdAt: currentTime,
    });
  }

  // Continue journey (2-5 more pages)
  const additionalPages = randomInt(1, 4);

  for (let i = 0; i < additionalPages; i++) {
    currentTime = addSeconds(currentTime, randomInt(30, 180)); // 30s - 3min between pages

    // Hulu-style funnel logic
    if (currentPage.path === '/') {
      // From homepage, users go to browse, plans, or watch content
      const rand = Math.random();
      if (rand < 0.4) {
        currentPage = PAGES.find(p => p.path === '/browse');
      } else if (rand < 0.6) {
        currentPage = PAGES.find(p => p.path === '/plans');
      } else {
        currentPage = weightedRandom(PAGES);
      }
    } else if (currentPage.path === '/browse') {
      // From browse, drill into categories or watch content
      const rand = Math.random();
      if (rand < 0.3) {
        currentPage = PAGES.find(p => p.path === '/browse/tv-shows');
      } else if (rand < 0.5) {
        currentPage = PAGES.find(p => p.path === '/browse/movies');
      } else if (rand < 0.7) {
        currentPage = weightedRandom(PAGES.filter(p => p.path.startsWith('/watch/')));
      } else {
        currentPage = weightedRandom(PAGES);
      }
    } else if (currentPage.path.startsWith('/browse/')) {
      // From category pages, watch content
      if (Math.random() < 0.6) {
        currentPage = weightedRandom(PAGES.filter(p => p.path.startsWith('/watch/')));
      } else {
        currentPage = weightedRandom(PAGES);
      }
    } else if (currentPage.path === '/plans') {
      // From plans, go to signup
      if (Math.random() < 0.4) {
        currentPage = PAGES.find(p => p.path === '/signup');
      } else {
        currentPage = weightedRandom(PAGES);
      }
    } else if (currentPage.path === '/signup') {
      // 50% convert to subscribe
      if (Math.random() < 0.5) {
        currentPage = PAGES.find(p => p.path === '/subscribe');
      } else {
        break; // Exit funnel
      }
    } else if (currentPage.path === '/subscribe') {
      // End of conversion funnel - they subscribed!
      break;
    } else if (currentPage.path.startsWith('/watch/')) {
      // From watching, go to my-stuff or browse more
      if (Math.random() < 0.3) {
        currentPage = PAGES.find(p => p.path === '/my-stuff');
      } else {
        currentPage = weightedRandom(PAGES);
      }
    } else {
      currentPage = weightedRandom(PAGES);
    }

    events.push({
      id: uuidv4(),
      websiteId,
      sessionId: session.id,
      visitId,
      urlPath: currentPage.path,
      urlQuery: null,
      referrerDomain: null,
      referrerPath: null,
      pageTitle: currentPage.title,
      eventType: 1,
      eventName: null,
      hostname: 'hulu.com',
      createdAt: currentTime,
    });

    // Chance for custom events on this page
    const pageEvents = CUSTOM_EVENTS.filter(e => Math.random() < e.frequency / 3);
    for (const evt of pageEvents) {
      currentTime = addSeconds(currentTime, randomInt(10, 60));
      events.push({
        id: uuidv4(),
        websiteId,
        sessionId: session.id,
        visitId,
        urlPath: currentPage.path,
        urlQuery: null,
        referrerDomain: null,
        referrerPath: null,
        pageTitle: null,
        eventType: 2,
        eventName: evt.name,
        hostname: 'hulu.com',
        createdAt: currentTime,
      });
    }
  }

  return events;
}

function generateEventData(event) {
  if (event.eventType !== 2 || !event.eventName) return null;

  const data = [];
  const shows = [
    'the-bear',
    'shogun',
    'abbott-elementary',
    'the-handmaids-tale',
    'futurama',
    'greys-anatomy',
  ];
  const genres = ['drama', 'comedy', 'action', 'thriller', 'documentary', 'sci-fi', 'romance'];

  switch (event.eventName) {
    case 'click_start_trial':
      data.push(
        {
          id: uuidv4(),
          websiteId: event.websiteId,
          websiteEventId: event.id,
          dataKey: 'button_text',
          stringValue: 'Start Your Free Trial',
          dataType: 1,
        },
        {
          id: uuidv4(),
          websiteId: event.websiteId,
          websiteEventId: event.id,
          dataKey: 'position',
          stringValue: 'hero',
          dataType: 1,
        },
      );
      break;
    case 'click_subscribe':
      data.push({
        id: uuidv4(),
        websiteId: event.websiteId,
        websiteEventId: event.id,
        dataKey: 'plan_type',
        stringValue: ['basic', 'premium', 'bundle'][randomInt(0, 2)],
        dataType: 1,
      });
      break;
    case 'play_video':
      data.push(
        {
          id: uuidv4(),
          websiteId: event.websiteId,
          websiteEventId: event.id,
          dataKey: 'content_id',
          stringValue: shows[randomInt(0, shows.length - 1)],
          dataType: 1,
        },
        {
          id: uuidv4(),
          websiteId: event.websiteId,
          websiteEventId: event.id,
          dataKey: 'duration_watched',
          numberValue: randomInt(60, 3600), // 1 min to 1 hour
          dataType: 2,
        },
        {
          id: uuidv4(),
          websiteId: event.websiteId,
          websiteEventId: event.id,
          dataKey: 'genre',
          stringValue: genres[randomInt(0, genres.length - 1)],
          dataType: 1,
        },
      );
      break;
    case 'add_to_my_stuff':
      data.push({
        id: uuidv4(),
        websiteId: event.websiteId,
        websiteEventId: event.id,
        dataKey: 'content_id',
        stringValue: shows[randomInt(0, shows.length - 1)],
        dataType: 1,
      });
      break;
    case 'search_content':
      data.push({
        id: uuidv4(),
        websiteId: event.websiteId,
        websiteEventId: event.id,
        dataKey: 'search_term',
        stringValue: ['action movies', 'comedy series', 'new releases', 'the bear'][
          randomInt(0, 3)
        ],
        dataType: 1,
      });
      break;
    case 'complete_episode':
      data.push(
        {
          id: uuidv4(),
          websiteId: event.websiteId,
          websiteEventId: event.id,
          dataKey: 'content_id',
          stringValue: shows[randomInt(0, shows.length - 1)],
          dataType: 1,
        },
        {
          id: uuidv4(),
          websiteId: event.websiteId,
          websiteEventId: event.id,
          dataKey: 'episode_number',
          numberValue: randomInt(1, 10),
          dataType: 2,
        },
      );
      break;
  }

  return data.length > 0 ? data : null;
}

function generateRevenue(event, session) {
  // Only generate revenue for subscribe conversions
  if (event.urlPath !== '/subscribe') return null;

  // Hulu subscription tiers
  const tiers = [
    { revenue: 7.99, currency: 'USD', weight: 40, name: 'basic' }, // Hulu Basic (with ads)
    { revenue: 17.99, currency: 'USD', weight: 35, name: 'premium' }, // Hulu (No Ads)
    { revenue: 76.99, currency: 'USD', weight: 25, name: 'bundle' }, // Disney Bundle
  ];

  // Different currencies based on country
  const currencyMap = { GB: 'GBP', DE: 'EUR', FR: 'EUR', ES: 'EUR' };
  const baseCurrency = currencyMap[session.country] || 'USD';

  const tier = weightedRandom(tiers);
  const revenueAmount = tier.revenue;
  const currency = baseCurrency;

  return {
    id: uuidv4(),
    websiteId: event.websiteId,
    sessionId: event.sessionId,
    eventId: event.id,
    eventName: 'subscription_created',
    currency,
    revenue: revenueAmount,
    createdAt: event.createdAt,
  };
}

// ============================================================================
// Database Operations
// ============================================================================

async function setupPrisma() {
  const url = new URL(process.env.DATABASE_URL);
  const adapter = new PrismaPg(
    { connectionString: url.toString() },
    { schema: url.searchParams.get('schema') },
  );
  return new PrismaClient({ adapter });
}

async function getWebsite(prisma, domain) {
  const website = await prisma.website.findFirst({
    where: { domain },
  });

  if (!website) {
    throw new Error(`Website with domain "${domain}" not found. Please create it first.`);
  }

  return website;
}

async function cleanExistingData(prisma, websiteId) {
  console.log('\n🗑️  Cleaning existing data for website...');

  // Delete in reverse dependency order
  await prisma.revenue.deleteMany({ where: { websiteId } });
  await prisma.eventData.deleteMany({ where: { websiteEvent: { websiteId } } });
  await prisma.websiteEvent.deleteMany({ where: { websiteId } });
  await prisma.sessionData.deleteMany({ where: { session: { websiteId } } });
  await prisma.session.deleteMany({ where: { websiteId } });
  await prisma.report.deleteMany({ where: { websiteId } });
  await prisma.segment.deleteMany({ where: { websiteId } });

  console.log('✓ Existing data cleaned');
}

async function insertData(prisma, sessions, events, eventDataList, revenueList) {
  console.log('\n📝 Inserting data into database...');

  // Insert sessions in batches
  const sessionBatchSize = 1000;
  for (let i = 0; i < sessions.length; i += sessionBatchSize) {
    const batch = sessions.slice(i, i + sessionBatchSize);
    await prisma.session.createMany({
      data: batch,
      skipDuplicates: true,
    });
    process.stdout.write(
      `\r   Sessions: ${Math.min(i + sessionBatchSize, sessions.length)}/${sessions.length}`,
    );
  }
  console.log(' ✓');

  // Insert events in batches
  const eventBatchSize = 2000;
  for (let i = 0; i < events.length; i += eventBatchSize) {
    const batch = events.slice(i, i + eventBatchSize);
    await prisma.websiteEvent.createMany({
      data: batch,
      skipDuplicates: true,
    });
    process.stdout.write(
      `\r   Events: ${Math.min(i + eventBatchSize, events.length)}/${events.length}`,
    );
  }
  console.log(' ✓');

  // Insert event data
  if (eventDataList.length > 0) {
    const dataBatchSize = 2000;
    for (let i = 0; i < eventDataList.length; i += dataBatchSize) {
      const batch = eventDataList.slice(i, i + dataBatchSize);
      await prisma.eventData.createMany({
        data: batch,
        skipDuplicates: true,
      });
      process.stdout.write(
        `\r   Event Data: ${Math.min(i + dataBatchSize, eventDataList.length)}/${eventDataList.length}`,
      );
    }
    console.log(' ✓');
  }

  // Insert revenue
  if (revenueList.length > 0) {
    await prisma.revenue.createMany({
      data: revenueList,
      skipDuplicates: true,
    });
    console.log(`   Revenue: ${revenueList.length}/${revenueList.length} ✓`);
  }
}

async function createDemoReportsAndSegments(prisma, websiteId, userId) {
  console.log('\n📊 Creating demo reports and segments...');

  const now = new Date();

  // Helper to get date 30 days ago
  const thirtyDaysAgo = subDays(now, 30);

  // ============================================================================
  // FUNNELS
  // ============================================================================

  const funnels = [
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'funnel',
      name: 'Subscription Conversion Funnel',
      description: 'Track users from homepage to subscription',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        window: 30, // 30 minutes to complete
        steps: [
          { type: 'path', value: '/' },
          { type: 'path', value: '/plans' },
          { type: 'path', value: '/signup' },
          { type: 'path', value: '/subscribe' },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'funnel',
      name: 'Content Discovery Journey',
      description: 'How users find and watch content',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        window: 60, // 60 minutes to complete
        steps: [
          { type: 'path', value: '/browse' },
          { type: 'path', value: '/browse/tv-shows' },
          { type: 'path', value: '/watch/*' },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'funnel',
      name: 'Browse to Watch Flow',
      description: 'From browsing to actually watching',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        window: 45,
        steps: [
          { type: 'path', value: '/browse' },
          { type: 'path', value: '/watch/*' },
          { type: 'event', value: 'play_video' },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'funnel',
      name: 'Trial to Subscription',
      description: 'Track trial CTA to subscription',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        window: 20,
        steps: [
          { type: 'event', value: 'click_start_trial' },
          { type: 'path', value: '/plans' },
          { type: 'path', value: '/subscribe' },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  // ============================================================================
  // SEGMENTS
  // ============================================================================

  const segments = [
    {
      id: uuidv4(),
      websiteId,
      type: 'segment',
      name: 'US Mobile Streamers',
      parameters: {
        filters: [
          { name: 'country', operator: 'eq', value: 'US' },
          { name: 'device', operator: 'eq', value: 'mobile' },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      websiteId,
      type: 'segment',
      name: 'Smart TV Users',
      parameters: {
        filters: [
          { name: 'device', operator: 'eq', value: 'desktop' },
          { name: 'screen', operator: 'eq', value: '1920x1080' },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      websiteId,
      type: 'segment',
      name: 'Content Watchers',
      parameters: {
        filters: [{ name: 'path', operator: 'c', value: '/watch/' }],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      websiteId,
      type: 'segment',
      name: 'International Viewers',
      parameters: {
        filters: [
          {
            name: 'country',
            operator: 'eq',
            value: 'GB,DE,FR,ES,NL',
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      websiteId,
      type: 'segment',
      name: 'Browse Users',
      parameters: {
        filters: [{ name: 'path', operator: 'c', value: '/browse' }],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      websiteId,
      type: 'segment',
      name: 'Tablet Streamers',
      parameters: {
        filters: [
          {
            name: 'device',
            operator: 'eq',
            value: 'tablet',
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  // ============================================================================
  // COHORTS
  // ============================================================================

  const cohorts = [
    {
      id: uuidv4(),
      websiteId,
      type: 'cohort',
      name: 'November Subscribers',
      parameters: {
        dateRange: {
          startDate: '2025-11-01T00:00:00.000Z',
          endDate: '2025-11-30T23:59:59.999Z',
        },
        action: {
          type: 'path',
          value: '/subscribe',
        },
        filters: [],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      websiteId,
      type: 'cohort',
      name: 'Social Media Traffic',
      parameters: {
        dateRange: {
          startDate: thirtyDaysAgo.toISOString(),
          endDate: now.toISOString(),
        },
        action: {
          type: 'path',
          value: '/',
        },
        filters: [{ name: 'referrer', operator: 'c', value: 'facebook' }],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      websiteId,
      type: 'cohort',
      name: 'Google Ads Subscribers',
      parameters: {
        dateRange: {
          startDate: thirtyDaysAgo.toISOString(),
          endDate: now.toISOString(),
        },
        action: {
          type: 'path',
          value: '/subscribe',
        },
        filters: [{ name: 'query', operator: 'c', value: 'utm_source=google' }],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      websiteId,
      type: 'cohort',
      name: 'Active Viewers',
      parameters: {
        dateRange: {
          startDate: subDays(now, 14).toISOString(), // Last 2 weeks
          endDate: now.toISOString(),
        },
        action: {
          type: 'event',
          value: 'play_video',
        },
        filters: [{ name: 'path', operator: 'c', value: '/watch' }],
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  // ============================================================================
  // OTHER USEFUL REPORTS
  // ============================================================================

  const otherReports = [
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'retention',
      name: 'Viewer Retention Analysis',
      description: 'Track returning viewers over 30 days',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'journey',
      name: 'Top Viewer Journeys',
      description: 'Most common content discovery paths (5 steps)',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        steps: 5,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'utm',
      name: 'UTM Campaign Performance',
      description: 'All UTM campaign metrics',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'revenue',
      name: 'Subscription Revenue by Country',
      description: 'Revenue breakdown by geographic location',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        currency: 'USD',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      userId,
      websiteId,
      type: 'goal',
      name: 'Video Play Goal',
      description: 'Track video streaming engagement',
      parameters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        type: 'event',
        value: 'play_video',
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Insert all reports
  const allReports = [...funnels, ...otherReports];
  await prisma.report.createMany({
    data: allReports,
    skipDuplicates: true,
  });
  console.log(`   Reports: ${allReports.length}/${allReports.length} ✓`);

  // Insert all segments and cohorts
  const allSegments = [...segments, ...cohorts];
  await prisma.segment.createMany({
    data: allSegments,
    skipDuplicates: true,
  });
  console.log(`   Segments & Cohorts: ${allSegments.length}/${allSegments.length} ✓`);
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Umami Test Data Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Parse CLI arguments
  const args = process.argv.slice(2);
  const scaleArg = args.find(arg => arg.startsWith('--scale='))?.split('=')[1];
  const cleanArg = args.includes('--clean');
  const appendArg = args.includes('--append');

  const scale = SCALES[scaleArg] || SCALES.small;

  console.log(`📊 Scale: ${scaleArg || 'small'} (${scale.description})\n`);

  // Setup Prisma
  const prisma = await setupPrisma();

  try {
    // Get website
    console.log('🔍 Looking up website...');
    const website = await getWebsite(prisma, 'hulu.com');
    console.log(`✓ Found website: ${website.name} (${website.id})\n`);

    // Get admin user for reports
    const adminUser = await prisma.user.findFirst({
      where: { username: 'admin' },
    });
    if (!adminUser) {
      throw new Error('Admin user not found. Please ensure Umami is properly set up.');
    }

    // Prompt for clean/append
    let shouldClean = cleanArg;
    if (!cleanArg && !appendArg) {
      const answer = await promptUser(
        '❓ Clean existing data or append? (clean/append) [append]: ',
      );
      shouldClean = answer === 'clean';
    }

    if (shouldClean) {
      await cleanExistingData(prisma, website.id);
    } else {
      console.log('➕ Appending to existing data\n');
    }

    // Generate data
    console.log('🎲 Generating test data...');
    const now = new Date();
    const startDate = subDays(startOfDay(now), scale.days - 1);

    const allSessions = [];
    const allEvents = [];
    const allEventData = [];
    const allRevenue = [];

    let totalSessionsGenerated = 0;
    const totalDays = scale.days;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let day = 0; day < scale.days; day++) {
      const currentDay = addHours(startDate, day * 24);
      const dayOfWeek = currentDay.getDay();
      const weekNum = Math.floor(day / 7);
      const isToday = day === scale.days - 1;

      const weekMultiplier = getWeekMultiplier(weekNum, Math.ceil(totalDays / 7));
      const dayMultiplier = getWeekdayMultiplier(dayOfWeek);
      const sessionsToday = Math.round(scale.avgSessionsPerDay * weekMultiplier * dayMultiplier);

      for (let sessionIdx = 0; sessionIdx < sessionsToday; sessionIdx++) {
        // Distribute sessions across 24 hours with realistic pattern
        // For today, only generate up to current time
        const maxHour = isToday ? currentHour : 23;
        const hour = randomInt(0, maxHour);
        const maxMinute = isToday && hour === currentHour ? currentMinute : 59;
        const minute = randomInt(0, maxMinute);
        const sessionTime = addHours(currentDay, hour + minute / 60);

        // Skip if session time is in the future
        if (sessionTime > now) continue;

        const hourMultiplier = getHourlyMultiplier(hour);
        if (Math.random() > hourMultiplier) continue; // Skip this session based on hour

        const session = generateSession(website.id, sessionTime);
        allSessions.push(session);

        const events = generateUserJourney(session, website.id, sessionTime);
        allEvents.push(...events);

        // Generate event data for custom events
        for (const event of events) {
          const eventData = generateEventData(event);
          if (eventData) {
            allEventData.push(...eventData);
          }

          // Generate revenue for conversions
          const revenue = generateRevenue(event, session);
          if (revenue) {
            allRevenue.push(revenue);
          }
        }

        totalSessionsGenerated++;
      }

      process.stdout.write(
        `\r   Day ${day + 1}/${scale.days}: ${totalSessionsGenerated} sessions, ${allEvents.length} events`,
      );
    }

    console.log(' ✓\n');

    console.log('📈 Generated:');
    console.log(`   Sessions: ${allSessions.length}`);
    console.log(`   Events: ${allEvents.length}`);
    console.log(`   Event Data: ${allEventData.length}`);
    console.log(`   Revenue: ${allRevenue.length}`);

    // Insert into database
    await insertData(prisma, allSessions, allEvents, allEventData, allRevenue);

    // Create demo reports and segments
    await createDemoReportsAndSegments(prisma, website.id, adminUser.id);

    // Summary
    const totalRevenue = allRevenue.reduce((sum, r) => sum + Number(r.revenue), 0);
    const conversionRate = ((allRevenue.length / allSessions.length) * 100).toFixed(2);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Test data generated successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Sessions: ${allSessions.length.toLocaleString()}`);
    console.log(
      `   Pageviews: ${allEvents.filter(e => e.eventType === 1).length.toLocaleString()}`,
    );
    console.log(
      `   Custom Events: ${allEvents.filter(e => e.eventType === 2).length.toLocaleString()}`,
    );
    console.log(`   Conversions: ${allRevenue.length}`);
    console.log(`   Conversion Rate: ${conversionRate}%`);
    console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
