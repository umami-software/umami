'use client';
import { useTeam, useTeamUrl } from 'components/hooks';
import { Loading } from 'react-basics';
import TeamContext from './TeamContext';

export function Team({ children }) {
  const { teamId } = useTeamUrl();
  const { data: team, isLoading } = useTeam(teamId);

  if (isLoading) {
    return <Loading />;
  }

  if (!team) {
    return null;
  }

  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
}

export default Team;
