import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useSavedReplaysQuery(websiteId: string) {
  const { get } = useApi();
  const { modified } = useModified('replays');

  return usePagedQuery({
    queryKey: ['replays:saved', { websiteId, modified }],
    queryFn: pageParams => {
      return get(`/websites/${websiteId}/replays/saved`, {
        ...pageParams,
        pageSize: 20,
      });
    },
  });
}
