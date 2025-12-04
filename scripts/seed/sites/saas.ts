import { weightedRandom, type WeightedOption } from '../utils.js';
import type {
  SiteConfig,
  JourneyConfig,
  PageConfig,
  CustomEventConfig,
} from '../generators/events.js';
import type { RevenueConfig } from '../generators/revenue.js';

export const SAAS_WEBSITE_NAME = 'Demo SaaS';
export const SAAS_WEBSITE_DOMAIN = 'app.example.com';

const docsSections = [
  'getting-started',
  'installation',
  'configuration',
  'api-reference',
  'integrations',
];

const blogPosts = [
  'announcing-v2',
  'customer-success-story',
  'product-roadmap',
  'security-best-practices',
];

export const saasPages: PageConfig[] = [
  { path: '/', title: 'Demo SaaS - Analytics Made Simple', weight: 0.2, avgTimeOnPage: 45 },
  { path: '/features', title: 'Features', weight: 0.15, avgTimeOnPage: 90 },
  { path: '/pricing', title: 'Pricing', weight: 0.15, avgTimeOnPage: 120 },
  { path: '/docs', title: 'Documentation', weight: 0.1, avgTimeOnPage: 60 },
  { path: '/blog', title: 'Blog', weight: 0.05, avgTimeOnPage: 45 },
  { path: '/signup', title: 'Sign Up', weight: 0.08, avgTimeOnPage: 90 },
  { path: '/login', title: 'Login', weight: 0.05, avgTimeOnPage: 30 },
  { path: '/demo', title: 'Request Demo', weight: 0.05, avgTimeOnPage: 60 },
  ...docsSections.map(slug => ({
    path: `/docs/${slug}`,
    title: `Docs: ${slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')}`,
    weight: 0.02,
    avgTimeOnPage: 180,
  })),
  ...blogPosts.map(slug => ({
    path: `/blog/${slug}`,
    title: slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    weight: 0.02,
    avgTimeOnPage: 150,
  })),
];

export const saasJourneys: JourneyConfig[] = [
  // Conversion funnel
  { pages: ['/', '/features', '/pricing', '/signup'], weight: 0.12 },
  { pages: ['/', '/pricing', '/signup'], weight: 0.1 },
  { pages: ['/pricing', '/signup'], weight: 0.08 },

  // Feature exploration
  { pages: ['/', '/features'], weight: 0.1 },
  { pages: ['/', '/features', '/pricing'], weight: 0.08 },

  // Documentation users
  { pages: ['/docs', '/docs/getting-started'], weight: 0.08 },
  { pages: ['/docs/getting-started', '/docs/installation', '/docs/configuration'], weight: 0.06 },
  { pages: ['/docs/api-reference'], weight: 0.05 },

  // Blog readers
  { pages: ['/blog/announcing-v2'], weight: 0.05 },
  { pages: ['/blog/customer-success-story'], weight: 0.04 },

  // Returning users
  { pages: ['/login'], weight: 0.08 },

  // Bounces
  { pages: ['/'], weight: 0.08 },
  { pages: ['/pricing'], weight: 0.05 },

  // Demo requests
  { pages: ['/', '/demo'], weight: 0.03 },
];

export const saasCustomEvents: CustomEventConfig[] = [
  {
    name: 'signup_started',
    weight: 0.6,
    pages: ['/signup'],
    data: {
      plan: ['free', 'pro', 'enterprise'],
    },
  },
  {
    name: 'signup_completed',
    weight: 0.3,
    pages: ['/signup'],
    data: {
      plan: ['free', 'pro', 'enterprise'],
      method: ['email', 'google', 'github'],
    },
  },
  {
    name: 'purchase',
    weight: 0.15,
    pages: ['/signup', '/pricing'],
    data: {
      plan: ['pro', 'enterprise'],
      billing: ['monthly', 'annual'],
      revenue: [29, 49, 99, 299],
      currency: ['USD'],
    },
  },
  {
    name: 'demo_requested',
    weight: 0.5,
    pages: ['/demo'],
    data: {
      company_size: ['1-10', '11-50', '51-200', '200+'],
    },
  },
  {
    name: 'feature_viewed',
    weight: 0.3,
    pages: ['/features'],
    data: {
      feature: ['analytics', 'reports', 'api', 'integrations', 'privacy'],
    },
  },
  {
    name: 'cta_click',
    weight: 0.15,
    pages: ['/', '/features', '/pricing'],
    data: {
      button: ['hero_signup', 'nav_signup', 'pricing_cta', 'footer_cta'],
    },
  },
  {
    name: 'docs_search',
    weight: 0.2,
    pages: ['/docs', ...docsSections.map(s => `/docs/${s}`)],
    data: {
      query_type: ['api', 'setup', 'integration', 'troubleshooting'],
    },
  },
];

export const saasRevenueConfigs: RevenueConfig[] = [
  {
    eventName: 'purchase',
    minAmount: 29,
    maxAmount: 29,
    currency: 'USD',
    weight: 0.7, // 70% Pro plan
  },
  {
    eventName: 'purchase',
    minAmount: 299,
    maxAmount: 299,
    currency: 'USD',
    weight: 0.3, // 30% Enterprise
  },
];

export function getSaasSiteConfig(): SiteConfig {
  return {
    hostname: SAAS_WEBSITE_DOMAIN,
    pages: saasPages,
    journeys: saasJourneys,
    customEvents: saasCustomEvents,
  };
}

export function getSaasJourney(): string[] {
  const journeyWeights: WeightedOption<string[]>[] = saasJourneys.map(j => ({
    value: j.pages,
    weight: j.weight,
  }));

  return weightedRandom(journeyWeights);
}

export const SAAS_SESSIONS_PER_DAY = 500;
