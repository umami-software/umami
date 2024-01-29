import useApi from './useApi';

export function useWebsite(websiteId: string) {
  const { get, useQuery } = useApi();
  return useQuery({
    queryKey: ['websites', websiteId],
    queryFn: () => get(`/websites/${websiteId}`),
    enabled: !!websiteId,
  });
}

export default useWebsite;
