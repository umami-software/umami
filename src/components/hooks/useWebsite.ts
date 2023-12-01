import useApi from './useApi';

export function useWebsite(websiteId: string) {
  const { get, useQuery } = useApi();
  return useQuery(['websites', websiteId], () => get(`/websites/${websiteId}`), {
    enabled: !!websiteId,
  });
}

export default useWebsite;
