'use client';
import { createContext, ReactNode } from 'react';
import { Loading } from '@umami/react-zen';
import { Link } from '@/generated/prisma/client';
import { useLinkQuery } from '@/components/hooks/queries/useLinkQuery';

export const LinkContext = createContext<Link>(null);

export function LinkProvider({ linkId, children }: { linkId?: string; children: ReactNode }) {
  const { data: link, isLoading, isFetching } = useLinkQuery(linkId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!link) {
    return null;
  }

  return <LinkContext.Provider value={link}>{children}</LinkContext.Provider>;
}
