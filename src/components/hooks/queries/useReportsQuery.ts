import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';

export function useReportsQuery({ websiteId, teamId }: { websiteId?: string; teamId?: string }) {
  const { modified } = useModified(`reports`);
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['reports', { websiteId, teamId, modified }],
    queryFn: (params: any) => {
      return get('/reports', { websiteId, teamId, ...params });
    },
  });
}
