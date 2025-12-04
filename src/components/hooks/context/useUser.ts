import { useContext } from 'react';
import { UserContext } from '@/app/(main)/admin/users/[userId]/UserProvider';

export function useUser() {
  return useContext(UserContext);
}
