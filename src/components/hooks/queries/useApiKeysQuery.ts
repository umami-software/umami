import { useApi } from '../useApi';
import { useModified } from '../useModified';

export interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export function useApiKeysQuery() {
  const { get, useQuery } = useApi();
  const { modified } = useModified('api-keys');

  return useQuery<ApiKeyData[]>({
    queryKey: ['api-keys', { modified }],
    queryFn: () => get('/me/api-keys'),
  });
}
