'use client';
import { createContext, ReactNode } from 'react';
import { usePixelQuery } from '@/components/hooks';
import { Loading } from '@umami/react-zen';

export const PixelContext = createContext(null);

export function PixelProvider({ pixelId, children }: { pixelId?: string; children: ReactNode }) {
  const { data: pixel, isLoading, isFetching } = usePixelQuery(pixelId);

  if (isFetching && isLoading) {
    return <Loading position="page" />;
  }

  if (!pixel) {
    return null;
  }

  return <PixelContext.Provider value={pixel}>{children}</PixelContext.Provider>;
}
