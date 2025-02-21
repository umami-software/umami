'use client';
import { createContext, ReactNode, useEffect } from 'react';
import { useModified, useWebsite } from '@/components/hooks';
import { Loading } from 'react-basics';

export const WebsiteContext = createContext(null);

export function WebsiteProvider({
  websiteId,
  children,
}: {
  websiteId: string;
  children: ReactNode;
}) {
  const { modified } = useModified(`website:${websiteId}`);
  const { data: website, isFetching, isLoading, refetch } = useWebsite(websiteId);

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

export default WebsiteProvider;
