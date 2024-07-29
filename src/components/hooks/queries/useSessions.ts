import { useApi } from './useApi';
import { useFilterQuery } from './useFilterQuery';
import useModified from '../useModified';

export function useSessions(websiteId: string, params?: { [key: string]: string | number }) {
  const { get } = useApi();
  const { modified } = useModified(`sessions`);

  return useFilterQuery({
    queryKey: ['sessions', { websiteId, modified, ...params }],
    queryFn: (data: any) => {
      return get(`/websites/${websiteId}/sessions`, {
        ...data,
        ...params,
      });
    },
  });
}

export default useSessions;
