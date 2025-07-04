import { keepPreviousData } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { useSearchParams } from 'next/navigation';
import { ReactQueryOptions } from '@/lib/types';

export type WebsiteMetricsData = {
  x: string;
  y: number;
}[];

export function useWebsiteMetricsQuery(
  websiteId: string,
  params: { type: string; limit?: number; search?: string },
  options?: ReactQueryOptions<WebsiteMetricsData>,
) {
  const { get, useQuery } = useApi();
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();
  const searchParams = useSearchParams();

  return useQuery<WebsiteMetricsData>({
    queryKey: [
      'websites:metrics',
      {
        websiteId,
        ...date,
        ...filters,
        ...params,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/metrics`, {
        ...date,
        ...filters,
        [searchParams.get('view')]: undefined,
        ...params,
      }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
