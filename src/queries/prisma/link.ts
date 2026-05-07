import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import type { QueryFilters } from '@/lib/types';

export async function findLink(criteria: Prisma.LinkFindUniqueArgs) {
  return prisma.client.link.findUnique(criteria);
}

export async function getLink(linkId: string) {
  return findLink({
    where: {
      id: linkId,
    },
  });
}

export async function getLinks(criteria: Prisma.LinkFindManyArgs, filters: QueryFilters = {}) {
  const { search } = filters;
  const { getSearchParameters, pagedQuery } = prisma;

  const where: Prisma.LinkWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [
      { name: 'contains' },
      { url: 'contains' },
      { slug: 'contains' },
    ]),
  };

  return pagedQuery('link', { ...criteria, where }, filters);
}

export async function getUserLinks(userId: string, filters?: QueryFilters) {
  return getLinks(
    {
      where: {
        userId,
        deletedAt: null,
      },
    },
    filters,
  );
}

export async function getTeamLinks(teamId: string, filters?: QueryFilters) {
  return getLinks(
    {
      where: {
        teamId,
        deletedAt: null,
      },
    },
    filters,
  );
}

export async function createLink(data: Prisma.LinkUncheckedCreateInput) {
  return prisma.client.link.create({ data });
}

export async function updateLink(linkId: string, data: any) {
  // Fetch the old slug so we can invalidate its cache entry if the slug changes.
  const previous = await prisma.client.link.findUnique({
    where: { id: linkId },
    select: { slug: true },
  });
  const link = await prisma.client.link.update({ where: { id: linkId }, data });
  if (redis.enabled) {
    await redis.client.del(`link:${link.slug}`);
    if (previous && previous.slug !== link.slug) {
      await redis.client.del(`link:${previous.slug}`);
    }
  }
  return link;
}

export async function deleteLink(linkId: string) {
  const link = await prisma.client.link.delete({ where: { id: linkId } });
  if (redis.enabled) {
    await redis.client.del(`link:${link.slug}`);
  }
  return link;
}
