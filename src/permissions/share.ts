import { ENTITY_TYPE } from '@/lib/constants';
import type { Auth } from '@/lib/types';
import { canViewWebsite } from './website';

export type ShareSection =
  | 'overview'
  | 'events'
  | 'sessions'
  | 'realtime'
  | 'performance'
  | 'compare'
  | 'breakdown'
  | 'goals'
  | 'funnels'
  | 'journeys'
  | 'retention'
  | 'utm'
  | 'revenue'
  | 'attribution';

const SHARE_SECTIONS: ShareSection[] = [
  'overview',
  'events',
  'sessions',
  'realtime',
  'performance',
  'compare',
  'breakdown',
  'goals',
  'funnels',
  'journeys',
  'retention',
  'utm',
  'revenue',
  'attribution',
];

type ShareSectionInput = ShareSection | ShareSection[];

function shareTokenIncludesWebsite(auth: Auth | null | undefined, websiteId: string) {
  const { shareToken } = auth || {};

  return (
    shareToken?.websiteId === websiteId ||
    shareToken?.pixelId === websiteId ||
    shareToken?.linkId === websiteId ||
    shareToken?.websiteIds?.includes(websiteId) ||
    shareToken?.pixelIds?.includes(websiteId) ||
    shareToken?.linkIds?.includes(websiteId)
  );
}

export async function canViewWebsiteSection(
  auth: Auth | null | undefined,
  websiteId: string,
  section: ShareSectionInput,
) {
  if (auth?.user) {
    return canViewWebsite(auth, websiteId);
  }

  const { shareToken } = auth || {};

  if (!shareToken || !shareTokenIncludesWebsite(auth, websiteId)) {
    return false;
  }

  const sections = Array.isArray(section) ? section : [section];
  const hasSectionParameters = SHARE_SECTIONS.some(
    key => typeof shareToken.parameters?.[key] === 'boolean',
  );

  if (!hasSectionParameters) {
    return true;
  }

  return sections.some(key => shareToken.parameters?.[key] === true);
}

export async function canViewSharedWebsite(auth: Auth | null | undefined, websiteId: string) {
  if (auth?.user) {
    return canViewWebsite(auth, websiteId);
  }

  return shareTokenIncludesWebsite(auth, websiteId);
}

export async function canViewSharedWebsiteFilters(
  auth: Auth | null | undefined,
  websiteId: string,
) {
  if (auth?.user) {
    return canViewWebsite(auth, websiteId);
  }

  const { shareToken } = auth || {};

  return shareTokenIncludesWebsite(auth, websiteId) && shareToken?.parameters?.allowFilter !== false;
}

export async function canViewAuthenticatedWebsite(
  auth: Auth | null | undefined,
  websiteId: string,
) {
  if (!auth?.user) {
    return false;
  }

  return canViewWebsite(auth, websiteId);
}
