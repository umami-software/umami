import type { Link, Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { sanitizeSortFilters } from '@/lib/sort';
import type { PageResult, QueryFilters } from '@/lib/types';

const LINK_SORT_FIELDS = ['name', 'slug', 'url', 'createdAt'] as const;

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

export async function getLinks(
  criteria: Prisma.LinkFindManyArgs,
  filters: QueryFilters = {},
): Promise<PageResult<Link[]>> {
  const sortFilters = sanitizeSortFilters(filters, LINK_SORT_FIELDS);
  const { search } = sortFilters;
  const { getSearchParameters, pagedQuery } = prisma;

  const where: Prisma.LinkWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [
      { name: 'contains' },
      { url: 'contains' },
      { slug: 'contains' },
    ]),
  };

  return pagedQuery('link', { ...criteria, where }, sortFilters);
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

// The link is served from Redis by slug, so an update or delete must drop that key.
async function removeLinkFromCache(...slugs: string[]) {
  if (!redis.enabled) return;

  await Promise.all([...new Set(slugs)].map(slug => redis.client.del(`link:${slug}`)));
}

export async function updateLink(linkId: string, data: any) {
  const previous = redis.enabled ? await getLink(linkId) : null;
  const link = await prisma.client.link.update({ where: { id: linkId }, data });

  await removeLinkFromCache(...(previous ? [previous.slug] : []), link.slug);

  return link;
}

export async function deleteLink(linkId: string) {
  const link = await prisma.client.link.delete({ where: { id: linkId } });

  await removeLinkFromCache(link.slug);

  return link;
}
