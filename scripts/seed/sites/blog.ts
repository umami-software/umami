import { weightedRandom, type WeightedOption } from '../utils.js';
import type {
  SiteConfig,
  JourneyConfig,
  PageConfig,
  CustomEventConfig,
} from '../generators/events.js';

export const BLOG_WEBSITE_NAME = 'Demo Blog';
export const BLOG_WEBSITE_DOMAIN = 'blog.example.com';

const blogPosts = [
  'getting-started-with-analytics',
  'privacy-first-tracking',
  'understanding-your-visitors',
  'improving-page-performance',
  'seo-best-practices',
  'content-marketing-guide',
  'building-audience-trust',
  'data-driven-decisions',
];

export const blogPages: PageConfig[] = [
  { path: '/', title: 'Demo Blog - Home', weight: 0.25, avgTimeOnPage: 30 },
  { path: '/blog', title: 'Blog Posts', weight: 0.2, avgTimeOnPage: 45 },
  { path: '/about', title: 'About Us', weight: 0.1, avgTimeOnPage: 60 },
  { path: '/contact', title: 'Contact', weight: 0.05, avgTimeOnPage: 45 },
  ...blogPosts.map(slug => ({
    path: `/blog/${slug}`,
    title: slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    weight: 0.05,
    avgTimeOnPage: 180,
  })),
];

export const blogJourneys: JourneyConfig[] = [
  // Direct to blog post (organic search)
  { pages: ['/blog/getting-started-with-analytics'], weight: 0.15 },
  { pages: ['/blog/privacy-first-tracking'], weight: 0.12 },
  { pages: ['/blog/understanding-your-visitors'], weight: 0.1 },

  // Homepage bounces
  { pages: ['/'], weight: 0.15 },

  // Homepage to blog listing
  { pages: ['/', '/blog'], weight: 0.1 },

  // Homepage to blog post
  { pages: ['/', '/blog', '/blog/seo-best-practices'], weight: 0.08 },
  { pages: ['/', '/blog', '/blog/content-marketing-guide'], weight: 0.08 },

  // About page visits
  { pages: ['/', '/about'], weight: 0.07 },
  { pages: ['/', '/about', '/contact'], weight: 0.05 },

  // Blog post to another
  { pages: ['/blog/improving-page-performance', '/blog/data-driven-decisions'], weight: 0.05 },

  // Longer sessions
  { pages: ['/', '/blog', '/blog/building-audience-trust', '/about'], weight: 0.05 },
];

export const blogCustomEvents: CustomEventConfig[] = [
  {
    name: 'newsletter_signup',
    weight: 0.03,
    pages: ['/', '/blog'],
  },
  {
    name: 'share_click',
    weight: 0.05,
    pages: blogPosts.map(slug => `/blog/${slug}`),
    data: {
      platform: ['twitter', 'linkedin', 'facebook', 'copy_link'],
    },
  },
  {
    name: 'scroll_depth',
    weight: 0.2,
    pages: blogPosts.map(slug => `/blog/${slug}`),
    data: {
      depth: [25, 50, 75, 100],
    },
  },
];

export function getBlogSiteConfig(): SiteConfig {
  return {
    hostname: BLOG_WEBSITE_DOMAIN,
    pages: blogPages,
    journeys: blogJourneys,
    customEvents: blogCustomEvents,
  };
}

export function getBlogJourney(): string[] {
  const journeyWeights: WeightedOption<string[]>[] = blogJourneys.map(j => ({
    value: j.pages,
    weight: j.weight,
  }));

  return weightedRandom(journeyWeights);
}

export const BLOG_SESSIONS_PER_DAY = 3; // ~90 sessions per month
