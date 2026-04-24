import type { Board, Link, Pixel, Website } from '@/generated/prisma/client';
import { getBoard, getLink, getPixel, getWebsite } from '@/queries/prisma';

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
