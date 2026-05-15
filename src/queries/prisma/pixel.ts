import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { sanitizeSortFilters } from '@/lib/sort';
import type { QueryFilters } from '@/lib/types';

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

export async function getPixels(criteria: Prisma.PixelFindManyArgs, filters: QueryFilters = {}) {
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

export async function updatePixel(pixelId: string, data: any) {
  return prisma.client.pixel.update({ where: { id: pixelId }, data });
}

export async function deletePixel(pixelId: string) {
  return prisma.client.pixel.delete({ where: { id: pixelId } });
}
