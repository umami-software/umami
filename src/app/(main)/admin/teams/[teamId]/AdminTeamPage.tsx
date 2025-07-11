'use client';
import { TeamDetails } from '@/app/(main)/teams/[teamId]/settings/team/TeamDetails';
import { TeamProvider } from '@/app/(main)/teams/[teamId]/TeamProvider';

export function AdminTeamPage({ teamId }: { teamId: string }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamDetails teamId={teamId} />
    </TeamProvider>
  );
}
