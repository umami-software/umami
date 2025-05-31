import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';

export function useGoalQuery(
  { websiteId, reportId }: { websiteId: string; reportId: string },
  params?: { [key: string]: string | number },
) {
  const { post } = useApi();

  return usePagedQuery({
    queryKey: ['goal', { websiteId, reportId, ...params }],
    queryFn: (data: any) => {
      return post(`/reports/goals`, {
        ...data,
        ...params,
      });
    },
  });
}
