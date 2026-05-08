import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { sanitizeSortFilters } from '@/lib/sort';
import type { QueryFilters } from '@/lib/types';

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

export async function getLinks(criteria: Prisma.LinkFindManyArgs, filters: QueryFilters = {}) {
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
  const result = await prisma.client.link.create({ data });

  // Defensive: a slug may be reused after a hard-delete and the redirect cache
  // for that slug can still hold the old link's URL for up to 24h.
  if (redis.enabled && result.slug) {
    await redis.client.del(`link:${result.slug}`);
  }

  return result;
}

export async function updateLink(linkId: string, data: any) {
  const before = redis.enabled
    ? await prisma.client.link.findUnique({
        where: { id: linkId },
        select: { slug: true },
      })
    : null;

  const result = await prisma.client.link.update({ where: { id: linkId }, data });

  if (redis.enabled) {
    if (before?.slug) await redis.client.del(`link:${before.slug}`);
    if (result.slug && result.slug !== before?.slug) {
      await redis.client.del(`link:${result.slug}`);
    }
  }

  return result;
}

export async function deleteLink(linkId: string) {
  const before = redis.enabled
    ? await prisma.client.link.findUnique({
        where: { id: linkId },
        select: { slug: true },
      })
    : null;

  const result = await prisma.client.link.delete({ where: { id: linkId } });

  if (redis.enabled && before?.slug) {
    await redis.client.del(`link:${before.slug}`);
  }

  return result;
}
