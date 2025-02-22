import { createContext, ReactNode, useEffect } from 'react';
import { Loading } from '@umami/react-zen';
import { useModified, useUser } from '@/components/hooks';

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

  return <UserContext.Provider value={{ ...user, modified }}>{children}</UserContext.Provider>;
}
