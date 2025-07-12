'use client';
import { TeamProvider } from '@/app/(main)/teams/[teamId]/TeamProvider';
import { TeamDetails } from '@/app/(main)/settings/teams/[teamId]/TeamDetails';

export function TeamSettingsPage({ teamId }: { teamId: string }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamDetails teamId={teamId} />
    </TeamProvider>
  );
}
