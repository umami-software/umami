import { useState } from 'react';
import useApi from './useApi';
import useFilterQuery from 'components/hooks/useFilterQuery';

export function useReports(websiteId?: string) {
  const [modified, setModified] = useState(Date.now());
  const { get, del, useMutation } = useApi();
  const { mutate } = useMutation({ mutationFn: (reportId: string) => del(`/reports/${reportId}`) });
  const queryResult = useFilterQuery({
    queryKey: ['reports', { websiteId, modified }],
    queryFn: (params: any) => {
      return get(websiteId ? `/websites/${websiteId}/reports` : `/reports`, params);
    },
  });

  const deleteReport = (id: any) => {
    mutate(id, {
      onSuccess: () => {
        setModified(Date.now());
      },
    });
  };

  return {
    ...queryResult,
    deleteReport,
  };
}

export default useReports;
