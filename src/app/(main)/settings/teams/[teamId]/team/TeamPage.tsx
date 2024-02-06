'use client';
import TeamProvider from 'app/(main)/teams/[teamId]/TeamProvider';
import TeamDetails from './TeamDetails';

export function TeamMembersPage({ teamId }: { teamId: string }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamDetails teamId={teamId} />
    </TeamProvider>
  );
}

export default TeamMembersPage;
