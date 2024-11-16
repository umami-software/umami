import { UseQueryOptions } from '@tanstack/react-query';
import useApi from './useApi';
import { useFilterParams } from '../useFilterParams';
import { useSearchParams } from 'next/navigation';

export function useWebsiteMetrics(
  websiteId: string,
  queryParams: { type: string; limit?: number; search?: string; startAt?: number; endAt?: number },
  options?: Omit<UseQueryOptions & { onDataLoad?: (data: any) => void }, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);
  const searchParams = useSearchParams();

  return useQuery({
    queryKey: [
      'websites:metrics',
      {
        websiteId,
        ...params,
        ...queryParams,
      },
    ],
    queryFn: async () => {
      const filters = { ...params };
      const view = searchParams.get('view');

      if (view && filters[view]) {
        filters[view] = undefined;
      }

      const data = await get(`/websites/${websiteId}/metrics`, {
        ...filters,
        ...queryParams,
      });

      options?.onDataLoad?.(data);

      return data;
    },
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteMetrics;
