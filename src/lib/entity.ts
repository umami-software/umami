import { getLink, getPixel, getWebsite } from '@/queries/prisma';

export async function getEntity(entityId: string) {
  const website = await getWebsite(entityId);
  const link = await getLink(entityId);
  const pixel = await getPixel(entityId);

  const entity = website || link || pixel;

  return entity;
}
