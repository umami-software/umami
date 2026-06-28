'use client';
import { Loading } from '@umami/react-zen';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, type ReactNode, useEffect } from 'react';
import { useShareTokenQuery } from '@/components/hooks';
import { ENTITY_TYPE } from '@/lib/constants';
import type { ShareParameters, WhiteLabel } from '@/lib/types';
import { setShareData, useApp } from '@/store/app';

export interface ShareData {
  shareId: string;
  slug: string;
  shareType: number;
  websiteId?: string;
  websiteIds?: string[];
  boardId?: string;
  pixelId?: string;
  linkId?: string;
  parameters: ShareParameters;
  token: string;
  whiteLabel?: WhiteLabel;
}

export const ShareContext = createContext<ShareData>(null);

const selector = (state: { shareToken: { token?: string } | null }) => state.shareToken;

const ALL_SECTION_IDS = [
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

function getSharePath(pathname: string) {
  const segments = pathname.split('/');
  const firstSegment = segments[3];

  // If first segment looks like a domain name, skip it
  if (firstSegment?.includes('.')) {
    return segments[4];
  }

  return firstSegment;
}

export function ShareProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const { share, isLoading, isFetching } = useShareTokenQuery(slug);
  const router = useRouter();
  const pathname = usePathname();
  const shareToken = useApp(selector);
  const path = getSharePath(pathname);
  const isWebsiteShare = share?.shareType === ENTITY_TYPE.website;
  const isShareReady = !!share?.token && shareToken?.token === share.token;

  const allowedSections =
    isWebsiteShare && share?.parameters
      ? ALL_SECTION_IDS.filter(id => share.parameters[id] === true)
      : [];

  const shouldRedirect =
    isWebsiteShare &&
    allowedSections.length === 1 &&
    allowedSections[0] !== 'overview' &&
    (path === undefined || path === '' || path === 'overview');

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(`/share/${slug}/${allowedSections[0]}`);
    }
  }, [shouldRedirect, slug, allowedSections, router]);

  useEffect(() => {
    return () => {
      setShareData(null, null);
    };
  }, [slug]);

  if ((isFetching && isLoading) || (share && !isShareReady)) {
    return <Loading placement="absolute" />;
  }

  if (!share || !isShareReady || shouldRedirect) {
    return null;
  }

  return <ShareContext.Provider value={{ ...share, slug }}>{children}</ShareContext.Provider>;
}
