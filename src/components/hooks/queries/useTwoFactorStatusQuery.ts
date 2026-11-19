import { useApi } from '../useApi';

export interface TwoFactorStatusData {
  isEnabled: boolean;
  isRequired: boolean;
  isConfigured: boolean;
  globalRequired: boolean;
  requiredReason: 'global' | 'user' | 'team' | null;
}

export function useTwoFactorStatusQuery(enabled: boolean) {
  const { get, useQuery } = useApi();

  return useQuery<TwoFactorStatusData>({
    queryKey: ['2fa-status'],
    queryFn: () => get('/2fa/status'),
    enabled,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
