'use client';
import { TeamDetails } from '@/app/(main)/settings/teams/[teamId]/TeamDetails';
import { TeamProvider } from '@/app/(main)/settings/teams/[teamId]/TeamProvider';

export function AdminTeamPage({ teamId }: { teamId: string }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamDetails teamId={teamId} />
    </TeamProvider>
  );
}
