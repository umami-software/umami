'use client';
import TeamsContext from '../TeamsContext';
import { Loading } from 'react-basics';
import { useTeam } from 'components/hooks';
import { useParams } from 'next/navigation';

export default function Team({ children }) {
  const { id: teamId } = useParams();
  const { data: team, isLoading, error } = useTeam(teamId as string);

  if (error) {
    return null;
  }

  if (isLoading) {
    return <Loading position="page" />;
  }

  return <TeamsContext.Provider value={team}>{children}</TeamsContext.Provider>;
}
