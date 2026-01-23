import type { Link, Pixel, Website } from '@/generated/prisma/client';
import { getLink, getPixel, getWebsite } from '@/queries/prisma';

export async function getEntity(entityId: string): Promise<Website | Link | Pixel | null> {
  const website = await getWebsite(entityId);
  const link = await getLink(entityId);
  const pixel = await getPixel(entityId);

  const entity = website || link || pixel;

  return entity;
}
