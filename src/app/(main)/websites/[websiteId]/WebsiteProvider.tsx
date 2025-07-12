'use client';
import { createContext, ReactNode } from 'react';
import { useWebsiteQuery } from '@/components/hooks';
import { Loading } from '@umami/react-zen';
import { Website } from '@prisma/client';

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
    return <Loading position="page" />;
  }

  if (!website) {
    return null;
  }

  return <WebsiteContext.Provider value={website}>{children}</WebsiteContext.Provider>;
}
