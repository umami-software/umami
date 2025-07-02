import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export interface WebsitePageviewsData {
  pageviews: { x: string; y: number }[];
  sessions: { x: string; y: number }[];
}

export function useWebsitePageviewsQuery(
  { websiteId, compare }: { websiteId: string; compare?: string },
  options?: ReactQueryOptions<WebsitePageviewsData>,
) {
  const { get, useQuery } = useApi();
  const queryParams = useFilterParams(websiteId);

  return useQuery<WebsitePageviewsData>({
    queryKey: ['websites:pageviews', { websiteId, compare, ...queryParams }],
    queryFn: () => get(`/websites/${websiteId}/pageviews`, { compare, ...queryParams }),
    enabled: !!websiteId,
    ...options,
  });
}
