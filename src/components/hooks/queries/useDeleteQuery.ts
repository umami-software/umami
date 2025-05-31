import { useApi, useModified } from '@/components/hooks';

export function useDeleteQuery(path: string, params?: { [key: string]: any }) {
  const { del, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => del(path, params),
  });
  const { touch } = useModified();

  return { mutate, isPending, error, touch };
}
