import type { ReactQueryOptions } from '@/lib/types';
import type { WebsiteTreeNode } from '@/lib/websiteTree';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useWebsiteTreeQuery(
  { teamId }: { teamId?: string },
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { modified: websitesModified } = useModified('websites');
  const { modified: groupsModified } = useModified('website-groups');

  return useQuery<WebsiteTreeNode[]>({
    queryKey: ['website-tree', { teamId, websitesModified, groupsModified }],
    queryFn: () => get(teamId ? `/teams/${teamId}/website-tree` : '/me/website-tree'),
    ...options,
  });
}
