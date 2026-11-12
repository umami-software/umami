import type { Board, Link, Pixel, Website } from '@/generated/prisma/client';
import { getBoard, getLink, getPixel, getUser, getWebsite } from '@/queries/prisma';

export async function getEntity(entityId: string): Promise<Website | Link | Pixel | Board | null> {
  const [website, link, pixel, board] = await Promise.all([
    getWebsite(entityId),
    getLink(entityId),
    getPixel(entityId),
    getBoard(entityId),
  ]);

  const entity = website || link || pixel || board;

  return entity;
}

// Authorization resolves an id against every entity table, and dashboard boards use
// their owner's user id, so a caller-supplied id must not match any of them.
export async function isEntityIdInUse(id: string) {
  const [entity, user] = await Promise.all([getEntity(id), getUser(id, { showDeleted: true })]);

  return !!(entity || user);
}
