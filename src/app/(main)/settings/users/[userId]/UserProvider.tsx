import { createContext, ReactNode, useEffect } from 'react';
import { useModified, useUser } from '@/components/hooks';
import { Loading } from 'react-basics';

export const UserContext = createContext(null);

export function UserProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const { modified } = useModified(`user:${userId}`);
  const { data: user, isFetching, isLoading, refetch } = useUser(userId);

  useEffect(() => {
    if (modified) {
      refetch();
    }
  }, [modified]);

  if (isFetching && isLoading) {
    return <Loading position="page" />;
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export default UserProvider;
