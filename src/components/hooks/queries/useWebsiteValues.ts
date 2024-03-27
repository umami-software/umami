import { useApi } from 'components/hooks';

export function useWebsiteValues({
  websiteId,
  type,
  startDate,
  endDate,
  search,
}: {
  websiteId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  search?: string;
}) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['websites:values', { websiteId, type, startDate, endDate, search }],
    queryFn: () =>
      get(`/websites/${websiteId}/values`, {
        type,
        startAt: +startDate,
        endAt: +endDate,
        search,
      }),
    enabled: !!(websiteId && type && startDate && endDate),
  });
}

export default useWebsiteValues;
