'use client';
import { TeamSettings } from '@/app/(main)/teams/[teamId]/TeamSettings';
import { TeamProvider } from '@/app/(main)/teams/[teamId]/TeamProvider';

export function AdminTeamPage({ teamId }: { teamId: string }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamSettings teamId={teamId} />
    </TeamProvider>
  );
}
