import { useContext } from 'react';
import { TeamContext } from '@/app/(main)/teams/TeamProvider';

export function useTeam() {
  return useContext(TeamContext);
}
