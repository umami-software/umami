import { useApi } from '../useApi';
import { ReactQueryOptions } from '@/lib/types';

type DateRange = {
  startDate?: string;
  endDate?: string;
};

export function useDateRangeQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();

  const { data } = useQuery<DateRange>({
    queryKey: ['date-range', websiteId],
    queryFn: () => get(`/websites/${websiteId}/daterange`),
    enabled: !!websiteId,
    ...options,
  });

  return {
    startDate: data?.startDate ? new Date(data.startDate) : null,
    endDate: data?.endDate ? new Date(data.endDate) : null,
  };
}
