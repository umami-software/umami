import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export async function findShare(criteria: Prisma.ShareFindUniqueArgs) {
  return prisma.client.share.findUnique(criteria);
}

export async function getShare(entityId: string) {
  return findShare({
    where: {
      id: entityId,
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
