import { useApi } from '../useApi';

export function useUserQuery(userId: string, options?: { [key: string]: any }) {
  const { get, useQuery } = useApi();
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => get(`/users/${userId}`),
    enabled: !!userId,
    ...options,
  });
}
