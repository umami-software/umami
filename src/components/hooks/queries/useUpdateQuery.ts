import { useToast } from '@umami/react-zen';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useUpdateQuery(path: string, params?: Record<string, any>) {
  const { post, useMutation } = useApi();
  const query = useMutation({
    mutationFn: (data: Record<string, any>) => post(path, { ...data, ...params }),
  });
  const { touch } = useModified();
  const { toast } = useToast();

  return { ...query, touch, toast };
}
