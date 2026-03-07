import { useLinkQuery, usePixelQuery, useWebsiteQuery } from '@/components/hooks';
import type { BoardEntityType } from '@/lib/boards';

export function useBoardEntityBadgeProps(entityType?: BoardEntityType, entityId?: string) {
  const { data: website } = useWebsiteQuery(entityType === 'website' ? entityId : undefined);
  const { data: pixel } = usePixelQuery(entityType === 'pixel' ? entityId : undefined);
  const { data: link } = useLinkQuery(entityType === 'link' ? entityId : undefined);

  if (entityType === 'website' && website?.name) {
    return { type: entityType, name: website.name };
  }

  if (entityType === 'pixel' && pixel?.name) {
    return { type: entityType, name: pixel.name };
  }

  if (entityType === 'link' && link?.name) {
    return { type: entityType, name: link.name };
  }

  return null;
}
