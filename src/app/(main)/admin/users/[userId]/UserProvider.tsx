import { Loading } from '@umami/react-zen';
import { createContext, type ReactNode } from 'react';
import { useUserQuery } from '@/components/hooks/queries/useUserQuery';
import type { User } from '@/generated/prisma/client';

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
