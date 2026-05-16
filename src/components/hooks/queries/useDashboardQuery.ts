import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useDashboardQuery(options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified('dashboard');

  return useQuery({
    queryKey: ['dashboard', { modified }],
    queryFn: () => get('/dashboard'),
    placeholderData: keepPreviousData,
    ...options,
  });
}
