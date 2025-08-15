import { Prisma, Pixel } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { PageResult, QueryFilters } from '@/lib/types';

async function findPixel(criteria: Prisma.PixelFindUniqueArgs): Promise<Pixel> {
  return prisma.client.pixel.findUnique(criteria);
}

export async function getPixel(pixelId: string): Promise<Pixel> {
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
  const { search } = filters;

  const where: Prisma.PixelWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [{ name: 'contains' }]),
  };

  return prisma.pagedQuery('pixel', { ...criteria, where }, filters);
}

export async function getUserPixels(
  userId: string,
  filters?: QueryFilters,
): Promise<PageResult<Pixel[]>> {
  return getPixels(
    {
      where: {
        userId,
      },
    },
    filters,
  );
}

export async function getTeamPixels(
  teamId: string,
  filters?: QueryFilters,
): Promise<PageResult<Pixel[]>> {
  return getPixels(
    {
      where: {
        teamId,
      },
    },
    filters,
  );
}

export async function createPixel(data: Prisma.PixelUncheckedCreateInput): Promise<Pixel> {
  return prisma.client.pixel.create({ data });
}

export async function updatePixel(pixelId: string, data: any): Promise<Pixel> {
  return prisma.client.pixel.update({ where: { id: pixelId }, data });
}

export async function deletePixel(pixelId: string): Promise<Pixel> {
  return prisma.client.pixel.delete({ where: { id: pixelId } });
}
