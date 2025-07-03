import { useApi } from '../useApi';

export function useWebsite(websiteId: string, options?: { [key: string]: any }) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['website', { websiteId }],
    queryFn: () => get(`/websites/${websiteId}`, {}, { headers: { 'CF-Access-Client-Id': '571942449727ad914a422562e7931a4a.access', 'CF-Access-Client-Secret': '571942449727ad914a422562e7931a4a.secret' } }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsite;
