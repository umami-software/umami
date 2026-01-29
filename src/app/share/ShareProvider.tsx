'use client';
import { Loading } from '@umami/react-zen';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, type ReactNode, useEffect } from 'react';
import { useShareTokenQuery } from '@/components/hooks';
import type { WhiteLabel } from '@/lib/types';

export interface ShareData {
  shareId: string;
  slug: string;
  websiteId: string;
  parameters: any;
  token: string;
  whiteLabel?: WhiteLabel;
}

export const ShareContext = createContext<ShareData>(null);

const ALL_SECTION_IDS = [
  'overview',
  'events',
  'sessions',
  'realtime',
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

export function ShareProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const { share, isLoading, isFetching } = useShareTokenQuery(slug);
  const router = useRouter();
  const pathname = usePathname();
  const path = pathname.split('/')[3];

  const allowedSections = share?.parameters
    ? ALL_SECTION_IDS.filter(id => share.parameters[id] !== false)
    : [];

  const shouldRedirect =
    allowedSections.length === 1 &&
    allowedSections[0] !== 'overview' &&
    (path === undefined || path === '' || path === 'overview');

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(`/share/${slug}/${allowedSections[0]}`);
    }
  }, [shouldRedirect, slug, allowedSections, router]);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!share || shouldRedirect) {
    return null;
  }

  return <ShareContext.Provider value={{ ...share, slug }}>{children}</ShareContext.Provider>;
}
