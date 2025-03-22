'use client';
import { createContext, ReactNode, useEffect } from 'react';
import { useModified, useWebsiteQuery } from '@/components/hooks';
import { Loading } from '@umami/react-zen';

export const WebsiteContext = createContext(null);

export function WebsiteProvider({
  websiteId,
  children,
}: {
  websiteId: string;
  children: ReactNode;
}) {
  const { modified } = useModified(`website:${websiteId}`);
  const { data: website, isFetching, isLoading, refetch } = useWebsiteQuery(websiteId);

  useEffect(() => {
    if (modified) {
      refetch();
    }
  }, [modified]);

  if (isFetching && isLoading) {
    return <Loading position="page" />;
  }

  return <WebsiteContext.Provider value={website}>{children}</WebsiteContext.Provider>;
}
