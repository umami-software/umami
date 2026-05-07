import { keepPreviousData } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useDateParameters } from '@/components/hooks';
import type { SearchTermRow } from '@/lib/google';

export interface WebsiteSearchTermsData {
  rows: Array<SearchTermRow>;
  connected: boolean;
}

export function useWebsiteSearchTermsQuery(
  websiteId: string,
  params: {
    path?: string;
    googleDomain?: string;
    country?: string;
    limit?: number;
    offset?: number;
    enabled?: boolean;
  },
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useDateParameters();
  const { enabled = true, ...queryParams } = params;

  return useQuery<WebsiteSearchTermsData>({
    queryKey: [
      'website:search-terms',
      {
        websiteId,
        startAt,
        endAt,
        ...queryParams,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/search-terms`, {
        startAt,
        endAt,
        ...queryParams,
      }),
    enabled: enabled && !!websiteId && !!startAt && !!endAt,
    placeholderData: keepPreviousData,
  });
}
