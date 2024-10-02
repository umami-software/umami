import { useApi } from './useApi';
import { usePagedQuery } from './usePagedQuery';
import useModified from '../useModified';
import { useFilterParams } from 'components/hooks/useFilterParams';

export function useWebsiteSessions(websiteId: string, params?: { [key: string]: string | number }) {
  const { get } = useApi();
  const { modified } = useModified(`sessions`);
  const filters = useFilterParams(websiteId);

  return usePagedQuery({
    queryKey: ['sessions', { websiteId, modified, ...params, ...filters }],
    queryFn: (data: any) => {
      return get(`/websites/${websiteId}/sessions`, {
        ...data,
        ...params,
        ...filters,
        pageSize: 20,
      });
    },
  });
}

export default useWebsiteSessions;
