'use client';
import { createContext, ReactNode } from 'react';
import { useLinkQuery } from '@/components/hooks';
import { Loading } from '@umami/react-zen';

export const LinkContext = createContext(null);

export function LinkProvider({ linkId, children }: { linkId?: string; children: ReactNode }) {
  const { data: link, isLoading, isFetching } = useLinkQuery(linkId);

  if (isFetching && isLoading) {
    return <Loading position="page" />;
  }

  if (!link) {
    return null;
  }

  return <LinkContext.Provider value={link}>{children}</LinkContext.Provider>;
}
