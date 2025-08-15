import { Prisma, Link } from '@prisma/client';
import prisma from '@/lib/prisma';
import { PageResult, QueryFilters } from '@/lib/types';

async function findLink(criteria: Prisma.LinkFindUniqueArgs): Promise<Link> {
  return prisma.client.link.findUnique(criteria);
}

export async function getLink(linkId: string): Promise<Link> {
  return findLink({
    where: {
      id: linkId,
    },
  });
}

export async function getLinks(
  criteria: Prisma.LinkFindManyArgs,
  filters: QueryFilters = {},
): Promise<PageResult<Link[]>> {
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

export async function getUserLinks(
  userId: string,
  filters?: QueryFilters,
): Promise<PageResult<Link[]>> {
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

export async function getTeamLinks(
  teamId: string,
  filters?: QueryFilters,
): Promise<PageResult<Link[]>> {
  return getLinks(
    {
      where: {
        teamId,
      },
    },
    filters,
  );
}

export async function createLink(data: Prisma.LinkUncheckedCreateInput): Promise<Link> {
  return prisma.client.link.create({ data });
}

export async function updateLink(linkId: string, data: any): Promise<Link> {
  return prisma.client.link.update({ where: { id: linkId }, data });
}

export async function deleteLink(linkId: string): Promise<Link> {
  return prisma.client.link.delete({ where: { id: linkId } });
}
