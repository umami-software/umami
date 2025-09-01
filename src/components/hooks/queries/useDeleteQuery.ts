import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useDeleteQuery(path: string, params?: Record<string, any>) {
  const { del, useMutation } = useApi();
  const query = useMutation({
    mutationFn: () => del(path, params),
  });
  const { touch } = useModified();

  return { ...query, touch };
}
