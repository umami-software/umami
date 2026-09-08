import { useLinkQuery, usePixelQuery, useWebsiteQuery } from '@/components/hooks';
import type { BoardEntityType } from '@/lib/boards';

export function useBoardEntityAvailability(entityType?: BoardEntityType, entityId?: string) {
  const websiteQuery = useWebsiteQuery(entityType === 'website' ? entityId : undefined);
  const pixelQuery = usePixelQuery(entityType === 'pixel' ? entityId : undefined);
  const linkQuery = useLinkQuery(entityType === 'link' ? entityId : undefined);
  const query =
    entityType === 'website' ? websiteQuery : entityType === 'pixel' ? pixelQuery : linkQuery;

  if (!entityId) {
    return { isLoading: false, isUnavailable: false };
  }

  const status = (query.error as { status?: number } | null)?.status;

  return {
    isLoading: query.isLoading,
    isUnavailable: status === 401 || status === 404,
  };
}
