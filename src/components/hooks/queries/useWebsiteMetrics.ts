import { UseQueryOptions } from '@tanstack/react-query';
import useApi from './useApi';
import { useFilterParams } from '../useFilterParams';

export function useWebsiteMetrics(
  websiteId: string,
  type: string,
  limit: number,
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
        type,
        limit,
      },
    ],
    queryFn: async () => {
      const filters = { ...params };

      filters[type] = undefined;

      const data = await get(`/websites/${websiteId}/metrics`, {
        ...filters,
        type,
        limit,
      });

      options?.onDataLoad?.(data);

      return data;
    },
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteMetrics;
