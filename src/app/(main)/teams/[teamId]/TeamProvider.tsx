'use client';
import { createContext, ReactNode, useEffect } from 'react';
import { useTeam } from 'components/hooks';
import { Loading } from 'react-basics';
import useModified from 'store/modified';

export const TeamContext = createContext(null);

export function TeamProvider({ teamId, children }: { teamId?: string; children: ReactNode }) {
  const modified = useModified(state => state?.[`team:${teamId}`]);
  const { data: team, isLoading, isFetching, refetch } = useTeam(teamId);

  useEffect(() => {
    if (teamId && modified) {
      refetch();
    }
  }, [teamId, modified]);

  if (isFetching && isLoading) {
    return <Loading />;
  }

  if (teamId && !team) {
    return null;
  }

  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
}

export default TeamProvider;
