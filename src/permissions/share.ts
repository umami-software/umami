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

type ShareSectionInput = ShareSection | ShareSection[];

// Board shares carry no section flags. Board components never show per-visitor
// session data, so it is excluded from what a board share can read.
const BOARD_SHARE_EXCLUDED_SECTIONS: ShareSection[] = ['sessions'];

function isBoardShare(auth: Auth | null | undefined) {
  return auth?.shareToken?.shareType === ENTITY_TYPE.board;
}

// A signed-in user's own access is checked without the share token. A share token sent
// alongside a session only grants the share's scope, never the user's level of access.
async function canUserViewWebsite(auth: Auth | null | undefined, websiteId: string) {
  return !!auth?.user && canViewWebsite({ user: auth.user }, websiteId);
}

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
  if (await canUserViewWebsite(auth, websiteId)) {
    return true;
  }

  const { shareToken } = auth || {};

  if (!shareToken || !shareTokenIncludesWebsite(auth, websiteId)) {
    return false;
  }

  const sections = Array.isArray(section) ? section : [section];
  const hasSectionParameters = Object.entries(shareToken.parameters ?? {}).some(
    ([key, value]) => key !== 'allowFilter' && typeof value === 'boolean',
  );

  if (!hasSectionParameters) {
    if (isBoardShare(auth)) {
      return sections.some(key => !BOARD_SHARE_EXCLUDED_SECTIONS.includes(key));
    }

    return true;
  }

  return sections.some(key => shareToken.parameters?.[key] === true);
}

// For endpoints that return individual event or visitor rows rather than aggregates.
// Board components only render aggregates, so board shares cannot read rows.
export async function canViewWebsiteSectionRows(
  auth: Auth | null | undefined,
  websiteId: string,
  section: ShareSectionInput,
) {
  if (await canUserViewWebsite(auth, websiteId)) {
    return true;
  }

  if (isBoardShare(auth)) {
    return false;
  }

  return canViewWebsiteSection(auth, websiteId, section);
}

export async function canViewSharedWebsite(auth: Auth | null | undefined, websiteId: string) {
  if (await canUserViewWebsite(auth, websiteId)) {
    return true;
  }

  return shareTokenIncludesWebsite(auth, websiteId);
}

export async function canViewSharedWebsiteFilters(
  auth: Auth | null | undefined,
  websiteId: string,
) {
  if (await canUserViewWebsite(auth, websiteId)) {
    return true;
  }

  const { shareToken } = auth || {};

  return (
    shareTokenIncludesWebsite(auth, websiteId) && shareToken?.parameters?.allowFilter !== false
  );
}

export async function canViewAuthenticatedWebsite(
  auth: Auth | null | undefined,
  websiteId: string,
) {
  return canUserViewWebsite(auth, websiteId);
}
