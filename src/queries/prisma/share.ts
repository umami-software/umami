import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export async function findShare(criteria: Prisma.ShareFindUniqueArgs) {
  return prisma.client.share.findUnique(criteria);
}

export async function getShare(shareId: string) {
  return findShare({
    where: {
      id: shareId,
    },
  });
}

export async function getShareByCode(slug: string) {
  return findShare({
    where: {
      slug,
    },
  });
}

export async function getSharesByEntityId(entityId: string, filters?: QueryFilters) {
  const { pagedQuery } = prisma;

  return pagedQuery(
    'share',
    {
      where: {
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
    filters,
  );
}

export async function createShare(
  data: Prisma.ShareCreateInput | Prisma.ShareUncheckedCreateInput,
) {
  return prisma.client.share.create({
    data,
  });
}

export async function updateShare(
  shareId: string,
  data: Prisma.ShareUpdateInput | Prisma.ShareUncheckedUpdateInput,
) {
  return prisma.client.share.update({
    where: {
      id: shareId,
    },
    data,
  });
}

export async function deleteShare(shareId: string) {
  return prisma.client.share.delete({ where: { id: shareId } });
}
