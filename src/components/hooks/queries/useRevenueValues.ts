import { useApi } from '../useApi';

export function useRevenueValues(websiteId: string, startDate: Date, endDate: Date) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['revenue:values', { websiteId, startDate, endDate }],
    queryFn: () =>
      get(`/reports/revenue`, {
        websiteId,
        startDate,
        endDate,
      }),
    enabled: !!(websiteId && startDate && endDate),
  });
}

export default useRevenueValues;
