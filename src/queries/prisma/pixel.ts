import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import type { QueryFilters } from '@/lib/types';

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

export async function getPixels(criteria: Prisma.PixelFindManyArgs, filters: QueryFilters = {}) {
  const { search } = filters;

  const where: Prisma.PixelWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [{ name: 'contains' }, { slug: 'contains' }]),
  };

  return prisma.pagedQuery('pixel', { ...criteria, where }, filters);
}

export async function getUserPixels(userId: string, filters?: QueryFilters) {
  return getPixels(
    {
      where: {
        userId,
        deletedAt: null,
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
        deletedAt: null,
      },
    },
    filters,
  );
}

export async function createPixel(data: Prisma.PixelUncheckedCreateInput) {
  return prisma.client.pixel.create({ data });
}

export async function updatePixel(pixelId: string, data: any) {
  // Fetch the old slug so we can invalidate its cache entry if the slug changes.
  const previous = await prisma.client.pixel.findUnique({
    where: { id: pixelId },
    select: { slug: true },
  });
  const pixel = await prisma.client.pixel.update({ where: { id: pixelId }, data });
  if (redis.enabled) {
    await redis.client.del(`pixel:${pixel.slug}`);
    if (previous && previous.slug !== pixel.slug) {
      await redis.client.del(`pixel:${previous.slug}`);
    }
  }
  return pixel;
}

export async function deletePixel(pixelId: string) {
  const pixel = await prisma.client.pixel.delete({ where: { id: pixelId } });
  if (redis.enabled) {
    await redis.client.del(`pixel:${pixel.slug}`);
  }
  return pixel;
}
