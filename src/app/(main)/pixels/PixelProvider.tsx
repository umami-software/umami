'use client';
import { createContext, ReactNode } from 'react';
import { Loading } from '@umami/react-zen';
import { Pixel } from '@/generated/prisma/client';
import { usePixelQuery } from '@/components/hooks/queries/usePixelQuery';

export const PixelContext = createContext<Pixel>(null);

export function PixelProvider({ pixelId, children }: { pixelId?: string; children: ReactNode }) {
  const { data: pixel, isLoading, isFetching } = usePixelQuery(pixelId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!pixel) {
    return null;
  }

  return <PixelContext.Provider value={pixel}>{children}</PixelContext.Provider>;
}
