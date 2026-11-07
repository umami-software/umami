import { useApi } from '../useApi';
import { useModified } from '../useModified';

export interface SecurityKeyData {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export function useSecurityKeysQuery(enabled = true) {
  const { get, useQuery } = useApi();
  const { modified } = useModified('security-keys');

  return useQuery<SecurityKeyData[]>({
    queryKey: ['security-keys', { modified }],
    queryFn: () => get('/2fa/security-keys'),
    enabled,
  });
}
