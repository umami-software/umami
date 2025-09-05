'use client';
import { createContext, ReactNode } from 'react';
import { Loading } from '@umami/react-zen';
import { useTeamQuery } from '@/components/hooks/queries/useTeamQuery';
import { Team } from '@/generated/prisma/client';

export const TeamContext = createContext<Team>(null);

export function TeamProvider({ teamId, children }: { teamId?: string; children: ReactNode }) {
  const { data: team, isLoading, isFetching } = useTeamQuery(teamId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!team) {
    return null;
  }

  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
}
