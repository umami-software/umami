import { TeamContext } from '@/app/(main)/settings/teams/[teamId]/TeamProvider';
import { useContext } from 'react';

export function useTeam() {
  return useContext(TeamContext);
}
