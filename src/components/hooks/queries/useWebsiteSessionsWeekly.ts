import { useApi } from '../useApi';
import useModified from '../useModified';
import { useFilterParams } from '@/components/hooks/useFilterParams';

export function useWebsiteSessionsWeekly(
  websiteId: string,
  params?: { [key: string]: string | number },
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`sessions`);
  const filters = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['sessions', { websiteId, modified, ...params, ...filters }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/weekly`, {
        ...params,
        ...filters,
      });
    },
  });
}

export default useWebsiteSessionsWeekly;
