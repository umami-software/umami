import { useState } from 'react';
import useApi from './useApi';

export function useReports(websiteId) {
  const [modified, setModified] = useState(Date.now());
  const { get, useQuery, del, useMutation } = useApi();
  const { mutate } = useMutation(reportId => del(`/reports/${reportId}`));
  const { data, error, isLoading } = useQuery(['reports:website', { websiteId, modified }], () =>
    get(`/reports`, { websiteId }),
  );

  const deleteReport = id => {
    mutate(id, {
      onSuccess: () => {
        setModified(Date.now());
      },
    });
  };

  return { reports: data, error, isLoading, deleteReport };
}

export default useReports;
