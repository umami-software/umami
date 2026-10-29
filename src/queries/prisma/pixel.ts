import type { Pixel, Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { sanitizeSortFilters } from '@/lib/sort';
import type { PageResult, QueryFilters } from '@/lib/types';

const PIXEL_SORT_FIELDS = ['name', 'slug', 'createdAt'] as const;

export async function findPixel(criteria: Prisma.PixelFindUniqueArgs) {
  return prisma.client.pixel.findUnique(criteria);
}

export async function getPixel(pixelId: string) {
  return findPixel({
    where: {
      id: pixelId,
    },
  });
}

export async function getPixels(
  criteria: Prisma.PixelFindManyArgs,
  filters: QueryFilters = {},
): Promise<PageResult<Pixel[]>> {
  const sortFilters = sanitizeSortFilters(filters, PIXEL_SORT_FIELDS);
  const { search } = sortFilters;

  const where: Prisma.PixelWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [{ name: 'contains' }, { slug: 'contains' }]),
  };

  return prisma.pagedQuery('pixel', { ...criteria, where }, sortFilters);
}

export async function getUserPixels(userId: string, filters?: QueryFilters) {
  return getPixels(
    {
      where: {
        userId,
      },
    },
    filters,
  );
}

export async function getTeamPixels(teamId: string, filters?: QueryFilters) {
  return getPixels(
    {
      where: {
        teamId,
      },
    },
    filters,
  );
}

export async function createPixel(data: Prisma.PixelUncheckedCreateInput) {
  return prisma.client.pixel.create({ data });
}

// The pixel is served from Redis by slug, so an update or delete must drop that key.
async function removePixelFromCache(...slugs: string[]) {
  if (!redis.enabled) return;

  await Promise.all([...new Set(slugs)].map(slug => redis.client.del(`pixel:${slug}`)));
}

export async function updatePixel(pixelId: string, data: any) {
  const previous = redis.enabled ? await getPixel(pixelId) : null;
  const pixel = await prisma.client.pixel.update({ where: { id: pixelId }, data });

  await removePixelFromCache(...(previous ? [previous.slug] : []), pixel.slug);

  return pixel;
}

export async function deletePixel(pixelId: string) {
  const pixel = await prisma.client.pixel.delete({ where: { id: pixelId } });

  await removePixelFromCache(pixel.slug);

  return pixel;
}
