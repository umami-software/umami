import { UseQueryOptions } from '@tanstack/react-query';
import useApi from './useApi';
import { useFilterParams } from '../useFilterParams';

export function useWebsiteMetrics(
  websiteId: string,
  query: { type: string; limit: number; search: string },
  options?: Omit<UseQueryOptions & { onDataLoad?: (data: any) => void }, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: [
      'websites:metrics',
      {
        websiteId,
        ...params,
        ...query,
      },
    ],
    queryFn: async () => {
      const filters = { ...params };

      filters[query.type] = undefined;

      const data = await get(`/websites/${websiteId}/metrics`, {
        ...filters,
        ...query,
      });

      options?.onDataLoad?.(data);

      return data;
    },
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteMetrics;
