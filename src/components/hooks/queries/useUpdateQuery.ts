import { useApi, useModified } from '@/components/hooks';

export function useUpdateQuery(path: string, params?: Record<string, any>) {
  const { post, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: Record<string, any>) => post(path, { ...data, ...params }),
  });
  const { touch } = useModified();

  return { mutate, isPending, error, touch };
}
