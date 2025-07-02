import { keepPreviousData } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { useSearchParams } from 'next/navigation';
import { ReactQueryOptions } from '@/lib/types';

export type WebsiteMetricsData = {
  x: string;
  y: number;
}[];

export function useWebsiteMetricsQuery(
  websiteId: string,
  params: { type: string; limit?: number; search?: string; startAt?: number; endAt?: number },
  options?: ReactQueryOptions<WebsiteMetricsData>,
) {
  const { get, useQuery } = useApi();
  const queryParams = useFilterParams(websiteId);
  const searchParams = useSearchParams();

  return useQuery<WebsiteMetricsData>({
    queryKey: [
      'websites:metrics',
      {
        websiteId,
        ...queryParams,
        ...params,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/metrics`, {
        ...queryParams,
        [searchParams.get('view')]: undefined,
        ...params,
      }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
