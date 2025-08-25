import { TeamContext } from '@/app/(main)/teams/TeamProvider';
import { useContext } from 'react';

export function useTeam() {
  return useContext(TeamContext);
}
