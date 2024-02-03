'use client';
import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useCache from 'store/cache';

export function useReports({ websiteId, teamId }: { websiteId?: string; teamId?: string }) {
  const modified = useCache((state: any) => state?.reports);
  const { get, del, useMutation } = useApi();
  const queryResult = useFilterQuery({
    queryKey: ['reports', { websiteId, teamId, modified }],
    queryFn: (params: any) => {
      return get('/reports', { websiteId, teamId, ...params });
    },
  });
  const { mutate } = useMutation({ mutationFn: (reportId: string) => del(`/reports/${reportId}`) });

  const deleteReport = (reportId: any) => {
    mutate(reportId, {
      onSuccess: () => {},
    });
  };

  return {
    ...queryResult,
    deleteReport,
  };
}

export default useReports;
