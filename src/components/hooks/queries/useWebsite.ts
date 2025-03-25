import { useApi } from '../useApi';

export function useWebsite(websiteId: string, options?: { [key: string]: any }) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['website', { websiteId }],
    queryFn: () => get(`/websites/${websiteId}`),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsite;
