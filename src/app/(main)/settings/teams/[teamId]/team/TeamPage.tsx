'use client';
import TeamDetails from './TeamDetails';

export function TeamPage({ teamId }: { teamId: string }) {
  return <TeamDetails teamId={teamId} />;
}

export default TeamPage;
