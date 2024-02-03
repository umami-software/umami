'use client';
import { useTeam, useTeamContext } from 'components/hooks';
import { Loading } from 'react-basics';
import notFound from 'app/not-found';

export function Team({ children }) {
  const { teamId } = useTeamContext();
  const { data: team, isLoading } = useTeam(teamId);

  if (isLoading) {
    return <Loading />;
  }

  if (!team) {
    return notFound();
  }

  return children;
}

export default Team;
