import { UserContext } from '@/app/(main)/admin/users/[userId]/UserProvider';
import { useContext } from 'react';

export function useUser() {
  return useContext(UserContext);
}
