import { useApi } from '../useApi';

export function useTwoFactorStatusQuery(enabled: boolean) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['2fa-status'],
    queryFn: () => get('/2fa/status'),
    enabled,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
