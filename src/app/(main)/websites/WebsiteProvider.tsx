'use client';
import { createContext, ReactNode } from 'react';
import { Loading } from '@umami/react-zen';
import { Website } from '@/generated/prisma/client';
import { useWebsiteQuery } from '@/components/hooks/queries/useWebsiteQuery';

export const WebsiteContext = createContext<Website>(null);

export function WebsiteProvider({
  websiteId,
  children,
}: {
  websiteId: string;
  children: ReactNode;
}) {
  const { data: website, isFetching, isLoading } = useWebsiteQuery(websiteId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!website) {
    return null;
  }

  return <WebsiteContext.Provider value={website}>{children}</WebsiteContext.Provider>;
}
