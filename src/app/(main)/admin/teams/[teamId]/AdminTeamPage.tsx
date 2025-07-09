'use client';
import { TeamDetails } from '@/app/(main)/teams/[teamId]/settings/team/TeamDetails';

export function AdminTeamPage({ teamId }: { teamId: string }) {
  return (
    <>
      <TeamDetails teamId={teamId} />
    </>
  );
}
