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
  queryParams: { type: string; limit?: number; search?: string; startAt?: number; endAt?: number },
  options?: ReactQueryOptions<WebsiteMetricsData>,
) {
  const { get, useQuery } = useApi();
  const filterParams = useFilterParams(websiteId);
  const searchParams = useSearchParams();

  return useQuery<WebsiteMetricsData>({
    queryKey: [
      'websites:metrics',
      {
        websiteId,
        ...filterParams,
        ...queryParams,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/metrics`, {
        ...filterParams,
        [searchParams.get('view')]: undefined,
        ...queryParams,
      }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
