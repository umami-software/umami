import useApi from './useApi';

export function useReports(websiteId) {
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(['reports'], () => get(`/reports`, { websiteId }));

  return { reports: data, error, isLoading };
}

export default useReports;
