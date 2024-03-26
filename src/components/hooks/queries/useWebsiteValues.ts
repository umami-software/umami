import { useApi } from 'components/hooks';
import { subDays } from 'date-fns';

export function useWebsiteValues(websiteId: string, type: string) {
  const now = Date.now();
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['websites:values', websiteId, type],
    queryFn: () =>
      get(`/websites/${websiteId}/values`, {
        type,
        startAt: +subDays(now, 90),
        endAt: now,
      }),
    enabled: !!(websiteId && type),
  });
}

export default useWebsiteValues;
