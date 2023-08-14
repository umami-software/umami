import { useState } from 'react';
import useApi from './useApi';
import useApiFilter from 'hooks/useApiFilter';

export function useWebsiteReports(websiteId) {
  const [modified, setModified] = useState(Date.now());
  const { get, useQuery, del, useMutation } = useApi();
  const { mutate } = useMutation(reportId => del(`/reports/${reportId}`));
  const { filter, page, pageSize, handleFilterChange, handlePageChange, handlePageSizeChange } =
    useApiFilter();
  const { data, error, isLoading } = useQuery(
    ['reports:website', { websiteId, modified, filter, page, pageSize }],
    () => get(`/websites/${websiteId}/reports`, { websiteId, filter, page, pageSize }),
  );

  const deleteReport = id => {
    mutate(id, {
      onSuccess: () => {
        setModified(Date.now());
      },
    });
  };

  return {
    reports: data,
    error,
    isLoading,
    deleteReport,
    filter,
    page,
    pageSize,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  };
}

export default useWebsiteReports;
