import { createContext, ReactNode } from 'react';
import { Loading } from '@umami/react-zen';
import { useUserQuery } from '@/components/hooks';

export const UserContext = createContext(null);

export function UserProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const { data: user, isFetching, isLoading } = useUserQuery(userId);

  if (isFetching && isLoading) {
    return <Loading position="page" />;
  }

  if (!user) {
    return null;
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
