import { useToast } from '@umami/react-zen';
import type { ApiError } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useUpdateQuery(path: string, params?: Record<string, any>) {
  const { post, useMutation } = useApi();
  const query = useMutation<any, ApiError, Record<string, any>>({
    mutationFn: (data: Record<string, any>) => post(path, { ...data, ...params }),
  });
  const { touch } = useModified();
  const { toast } = useToast();

  return { ...query, touch, toast };
}
