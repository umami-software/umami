import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
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

  return pagedQuery(
    'link',
    { ...criteria, where },
    {
      ...filters,
      orderBy: filters.orderBy ?? 'createdAt',
      sortDescending: filters.sortDescending ?? true,
    },
  );
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
      },
    },
    filters,
  );
}

export async function createLink(data: Prisma.LinkUncheckedCreateInput) {
  return prisma.client.link.create({ data });
}

export async function updateLink(linkId: string, data: any) {
  return prisma.client.link.update({ where: { id: linkId }, data });
}

export async function deleteLink(linkId: string) {
  return prisma.client.link.delete({ where: { id: linkId } });
}

export async function getLinkClickCounts(linkIds: string[]): Promise<Record<string, number>> {
  if (linkIds.length === 0) return {};

  const results = await prisma.client.websiteEvent.groupBy({
    by: ['websiteId'],
    where: {
      websiteId: { in: linkIds },
      eventType: 1,
    },
    _count: {
      _all: true,
    },
  });

  const counts: Record<string, number> = {};
  for (const row of results) {
    counts[row.websiteId] = row._count._all;
  }
  return counts;
}
