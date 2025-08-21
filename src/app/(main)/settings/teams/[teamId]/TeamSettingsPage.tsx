'use client';
import { TeamProvider } from '@/app/(main)/teams/TeamProvider';
import { TeamSettings } from '@/app/(main)/teams/[teamId]/TeamSettings';

export function TeamSettingsPage({ teamId }: { teamId: string }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamSettings teamId={teamId} />
    </TeamProvider>
  );
}
