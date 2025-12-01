import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useUserQuery(userId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`user:${userId}`);

  return useQuery({
    queryKey: ['users', { userId, modified }],
    queryFn: () => get(`/users/${userId}`),
    enabled: !!userId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
