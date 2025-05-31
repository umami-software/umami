import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';

export function useGoalsQuery(
  { websiteId }: { websiteId: string },
  params?: { [key: string]: string | number },
) {
  const { get } = useApi();
  const { modified } = useModified(`goals`);

  return usePagedQuery({
    queryKey: ['goals', { websiteId, modified, ...params }],
    queryFn: (data: any) => {
      return get(`/websites/${websiteId}/goals`, {
        ...data,
        ...params,
      });
    },
  });
}
