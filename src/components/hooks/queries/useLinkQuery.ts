import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useLinkQuery(linkId: string) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`link:${linkId}`);

  return useQuery({
    queryKey: ['link', { linkId, modified }],
    queryFn: () => {
      return get(`/links/${linkId}`);
    },
    enabled: !!linkId,
  });
}
