import { createContext, ReactNode } from 'react';
import { Loading } from '@umami/react-zen';
import { User } from '@/generated/prisma/client';
import { useUserQuery } from '@/components/hooks/queries/useUserQuery';

export const UserContext = createContext<User>(null);

export function UserProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const { data: user, isFetching, isLoading } = useUserQuery(userId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!user) {
    return null;
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
