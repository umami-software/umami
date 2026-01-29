'use client';
import { Loading } from '@umami/react-zen';
import { createContext, type ReactNode } from 'react';
import { useShareTokenQuery } from '@/components/hooks';
import type { WhiteLabel } from '@/lib/types';

export interface ShareData {
  shareId: string;
  websiteId: string;
  parameters: any;
  token: string;
  whiteLabel?: WhiteLabel;
}

export const ShareContext = createContext<ShareData>(null);

export function ShareProvider({ shareId, children }: { shareId: string; children: ReactNode }) {
  const { share, isLoading, isFetching } = useShareTokenQuery(shareId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!share) {
    return null;
  }

  return <ShareContext.Provider value={share}>{children}</ShareContext.Provider>;
}
