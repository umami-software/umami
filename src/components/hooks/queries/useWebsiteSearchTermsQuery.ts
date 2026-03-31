import { keepPreviousData } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useDateParameters } from '@/components/hooks';
import { SearchTermRow } from '@/lib/google';

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
  },
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useDateParameters();

  return useQuery<WebsiteSearchTermsData>({
    queryKey: [
      'website:search-terms',
      {
        websiteId,
        startAt,
        endAt,
        ...params,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/search-terms`, {
        startAt,
        endAt,
        ...params,
      }),
    enabled: !!websiteId && !!startAt && !!endAt,
    placeholderData: keepPreviousData,
  });
}
