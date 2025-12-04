import { weightedRandom, pickRandom, randomInt, type WeightedOption } from '../utils.js';

export type ReferrerType = 'direct' | 'organic' | 'social' | 'paid' | 'referral';

export interface ReferrerInfo {
  type: ReferrerType;
  domain: string | null;
  path: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  fbclid: string | null;
}

const referrerTypeWeights: WeightedOption<ReferrerType>[] = [
  { value: 'direct', weight: 0.4 },
  { value: 'organic', weight: 0.25 },
  { value: 'social', weight: 0.15 },
  { value: 'paid', weight: 0.1 },
  { value: 'referral', weight: 0.1 },
];

const searchEngines = [
  { domain: 'google.com', path: '/search' },
  { domain: 'bing.com', path: '/search' },
  { domain: 'duckduckgo.com', path: '/' },
  { domain: 'yahoo.com', path: '/search' },
  { domain: 'baidu.com', path: '/s' },
];

const socialPlatforms = [
  { domain: 'twitter.com', path: null },
  { domain: 'x.com', path: null },
  { domain: 'linkedin.com', path: '/feed' },
  { domain: 'facebook.com', path: null },
  { domain: 'reddit.com', path: '/r/programming' },
  { domain: 'news.ycombinator.com', path: '/item' },
  { domain: 'threads.net', path: null },
  { domain: 'bsky.app', path: null },
];

const referralSites = [
  { domain: 'medium.com', path: '/@author/article' },
  { domain: 'dev.to', path: '/post' },
  { domain: 'hashnode.com', path: '/blog' },
  { domain: 'techcrunch.com', path: '/article' },
  { domain: 'producthunt.com', path: '/posts' },
  { domain: 'indiehackers.com', path: '/post' },
];

interface PaidCampaign {
  source: string;
  medium: string;
  campaign: string;
  useGclid?: boolean;
  useFbclid?: boolean;
}

const paidCampaigns: PaidCampaign[] = [
  { source: 'google', medium: 'cpc', campaign: 'brand_search', useGclid: true },
  { source: 'google', medium: 'cpc', campaign: 'product_awareness', useGclid: true },
  { source: 'facebook', medium: 'paid_social', campaign: 'retargeting', useFbclid: true },
  { source: 'facebook', medium: 'paid_social', campaign: 'lookalike', useFbclid: true },
  { source: 'linkedin', medium: 'cpc', campaign: 'b2b_targeting' },
  { source: 'twitter', medium: 'paid_social', campaign: 'launch_promo' },
];

const organicCampaigns = [
  { source: 'newsletter', medium: 'email', campaign: 'weekly_digest' },
  { source: 'newsletter', medium: 'email', campaign: 'product_update' },
  { source: 'partner', medium: 'referral', campaign: 'integration_launch' },
];

function generateClickId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRandomReferrer(): ReferrerInfo {
  const type = weightedRandom(referrerTypeWeights);

  const result: ReferrerInfo = {
    type,
    domain: null,
    path: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
    gclid: null,
    fbclid: null,
  };

  switch (type) {
    case 'direct':
      // No referrer data
      break;

    case 'organic': {
      const engine = pickRandom(searchEngines);
      result.domain = engine.domain;
      result.path = engine.path;
      break;
    }

    case 'social': {
      const platform = pickRandom(socialPlatforms);
      result.domain = platform.domain;
      result.path = platform.path;

      // Some social traffic has UTM params
      if (Math.random() < 0.3) {
        result.utmSource = platform.domain.replace('.com', '').replace('.net', '');
        result.utmMedium = 'social';
      }
      break;
    }

    case 'paid': {
      const campaign = pickRandom(paidCampaigns);
      result.utmSource = campaign.source;
      result.utmMedium = campaign.medium;
      result.utmCampaign = campaign.campaign;
      result.utmContent = `ad_${randomInt(1, 5)}`;

      if (campaign.useGclid) {
        result.gclid = generateClickId();
        result.domain = 'google.com';
        result.path = '/search';
      } else if (campaign.useFbclid) {
        result.fbclid = generateClickId();
        result.domain = 'facebook.com';
        result.path = null;
      }
      break;
    }

    case 'referral': {
      // Mix of pure referrals and organic campaigns
      if (Math.random() < 0.6) {
        const site = pickRandom(referralSites);
        result.domain = site.domain;
        result.path = site.path;
      } else {
        const campaign = pickRandom(organicCampaigns);
        result.utmSource = campaign.source;
        result.utmMedium = campaign.medium;
        result.utmCampaign = campaign.campaign;
      }
      break;
    }
  }

  return result;
}
