'use client';
import { createContext, ReactNode } from 'react';
import { useTeamQuery } from '@/components/hooks';
import { Loading } from '@umami/react-zen';

export const TeamContext = createContext(null);

export function TeamProvider({ teamId, children }: { teamId?: string; children: ReactNode }) {
  const { data: team, isLoading, isFetching } = useTeamQuery(teamId);

  if (isFetching && isLoading) {
    return <Loading position="page" />;
  }

  if (!team) {
    return null;
  }

  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
}
