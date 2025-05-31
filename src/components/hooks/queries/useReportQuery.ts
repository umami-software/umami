import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useReportQuery(reportId: string) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`report:${reportId}`);

  return useQuery({
    queryKey: ['report', { reportId, modified }],
    queryFn: (data: any) => {
      return get(`/reports/${reportId}`, {
        ...data,
      });
    },
    enabled: !!reportId,
  });
}
