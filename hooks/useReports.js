import useApi from './useApi';

export function useReports() {
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(['reports'], () => get(`/reports`));

  return { reports: data, error, isLoading };
}

export default useReports;
