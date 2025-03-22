'use client';
import { createContext, ReactNode, useEffect } from 'react';
import { useTeamQuery, useModified } from '@/components/hooks';
import { Loading } from '@umami/react-zen';

export const TeamContext = createContext(null);

export function TeamProvider({ teamId, children }: { teamId?: string; children: ReactNode }) {
  const { modified } = useModified(`teams`);
  const { data: team, isLoading, isFetching, refetch } = useTeamQuery(teamId);

  useEffect(() => {
    if (teamId && modified) {
      refetch();
    }
  }, [teamId, modified]);

  if (isFetching && isLoading) {
    return <Loading position="page" />;
  }

  if (teamId && !team) {
    return null;
  }

  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
}
