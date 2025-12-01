import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

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
