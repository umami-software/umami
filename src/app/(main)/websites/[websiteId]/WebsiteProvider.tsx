'use client';
import { createContext, ReactNode, useEffect } from 'react';
import { useWebsite } from 'components/hooks';
import { Loading } from 'react-basics';
import useModified from 'store/modified';

export const WebsiteContext = createContext(null);

export function WebsiteProvider({
  websiteId,
  children,
}: {
  websiteId: string;
  children: ReactNode;
}) {
  const modified = useModified(state => state?.[`website:${websiteId}`]);
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
