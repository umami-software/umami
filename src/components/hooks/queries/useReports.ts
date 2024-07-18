import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useModified from '../useModified';

export function useReports({ websiteId, teamId }: { websiteId?: string; teamId?: string }) {
  const { modified } = useModified(`reports`);
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
