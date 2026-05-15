import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useBoardQuery(boardId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`board:${boardId}`);

  return useQuery({
    queryKey: ['boards', { boardId, modified }],
    queryFn: () => get(`/boards/${boardId}`),
    enabled: !!boardId && boardId !== 'create',
    placeholderData: keepPreviousData,
    ...options,
  });
}
