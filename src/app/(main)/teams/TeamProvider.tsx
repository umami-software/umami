'use client';
import { Loading } from '@umami/react-zen';
import { createContext, type ReactNode } from 'react';
import { useTeamQuery } from '@/components/hooks/queries/useTeamQuery';
import type { Team } from '@/generated/prisma/client';

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
