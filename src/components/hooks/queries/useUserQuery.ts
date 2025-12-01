import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { keepPreviousData } from '@tanstack/react-query';
import { ReactQueryOptions } from '@/lib/types';

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
