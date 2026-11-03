import { ROLES } from '@/lib/constants';
import { getEntity } from '@/lib/entity';
import prisma from '@/lib/prisma';
import type { Auth } from '@/lib/types';
import { canViewWebsite } from './website';

export const SHARE_SECTIONS = [
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
] as const;

export type ShareSection = (typeof SHARE_SECTIONS)[number];

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

/**
 * The sections a team's view-only members are limited to on a team website, or null when the
 * user is not limited. Overview is always included, since it is the website's landing page.
 */
export async function getMemberSections(
  auth: Auth | null | undefined,
  websiteId: string,
): Promise<ShareSection[] | null> {
  const { user } = auth || {};

  if (!user || user.isAdmin) {
    return null;
  }

  const entity = await getEntity(websiteId);

  if (!entity?.teamId || entity.userId) {
    return null;
  }

  const teamUser = await prisma.client.teamUser.findFirst({
    where: { teamId: entity.teamId, userId: user.id, team: { deletedAt: null } },
    select: { role: true, team: { select: { viewOnlySections: true } } },
  });

  const sections = teamUser?.team.viewOnlySections;

  if (teamUser?.role !== ROLES.teamViewOnly || !Array.isArray(sections)) {
    return null;
  }

  return [
    'overview',
    ...SHARE_SECTIONS.filter(key => key !== 'overview' && sections.includes(key)),
  ];
}

export async function canViewWebsiteSection(
  auth: Auth | null | undefined,
  websiteId: string,
  section: ShareSectionInput,
) {
  const sections = Array.isArray(section) ? section : [section];

  if (auth?.user) {
    if (!(await canViewWebsite(auth, websiteId))) {
      return false;
    }

    const memberSections = await getMemberSections(auth, websiteId);

    return !memberSections || sections.some(key => memberSections.includes(key));
  }

  const { shareToken } = auth || {};

  if (!shareToken || !shareTokenIncludesWebsite(auth, websiteId)) {
    return false;
  }

  const hasSectionParameters = Object.entries(shareToken.parameters ?? {}).some(
    ([key, value]) => key !== 'allowFilter' && typeof value === 'boolean',
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

  return (
    shareTokenIncludesWebsite(auth, websiteId) && shareToken?.parameters?.allowFilter !== false
  );
}

export async function canViewAuthenticatedWebsite(
  auth: Auth | null | undefined,
  websiteId: string,
) {
  if (!auth?.user) {
    return false;
  }

  // A member limited to sections only sees what a share link could show.
  return (await canViewWebsite(auth, websiteId)) && !(await getMemberSections(auth, websiteId));
}
