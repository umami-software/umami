import type { Prisma } from '@/generated/prisma/client';
import { fetchOgMetadata } from '@/lib/og';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { sanitizeSortFilters } from '@/lib/sort';
import type { QueryFilters } from '@/lib/types';

const LINK_SORT_FIELDS = ['name', 'slug', 'url', 'createdAt'] as const;

type OgFieldName = 'ogTitle' | 'ogDescription' | 'ogImage';
type OgManualFlag = 'ogTitleManual' | 'ogDescriptionManual' | 'ogImageManual';

const OG_FIELDS: ReadonlyArray<OgFieldName> = ['ogTitle', 'ogDescription', 'ogImage'];

const OG_FIELD_TO_PARSED_KEY: Record<OgFieldName, 'title' | 'description' | 'image'> = {
  ogTitle: 'title',
  ogDescription: 'description',
  ogImage: 'image',
};

function flagOf(field: OgFieldName): OgManualFlag {
  return `${field}Manual` as OgManualFlag;
}

interface OgPreReadRow {
  url?: string | null;
  ogTitleManual?: boolean | null;
  ogDescriptionManual?: boolean | null;
  ogImageManual?: boolean | null;
}

// Sync intent classification + clear stale auto fields on url change; network fetch is deferred to backfillOgMetadata.
function applyOgIntent(data: any, currentRow: OgPreReadRow | null = null): void {
  for (const f of OG_FIELDS) {
    const flag = flagOf(f);
    const v = data[f];
    if (v === undefined) {
      delete data[f];
      delete data[flag];
    } else if (v === null) {
      data[flag] = false;
    } else {
      data[flag] = true;
    }
  }

  // On url change, null out auto-managed fields up front so the user never sees the prior URL's metadata.
  if (currentRow && data.url !== undefined && data.url !== currentRow.url) {
    for (const f of OG_FIELDS) {
      const flag = flagOf(f);
      if (data[flag] === true) continue;
      if (data[flag] === undefined && currentRow[flag]) continue;
      if (data[f] === undefined) {
        data[f] = null;
        data[flag] = false;
      }
    }
  }
}

// Run via next/server `after`; optimistic write guards against races on rapid edits, manual overrides, and deletes.
export async function backfillOgMetadata(
  linkId: string,
  data: any,
  currentRow: OgPreReadRow | null,
): Promise<void> {
  const targetUrl = data.url ?? currentRow?.url;
  if (!targetUrl) return;

  const urlChanged = currentRow ? data.url !== undefined && data.url !== currentRow.url : true;

  const candidateFields = OG_FIELDS.filter(f => {
    const flag = flagOf(f);
    const intent = data[flag];
    if (intent === true) return false;
    if (intent === false) return true;
    if (currentRow?.[flag]) return false;
    return urlChanged;
  });

  if (candidateFields.length === 0) return;

  let parsed;
  try {
    parsed = await fetchOgMetadata(targetUrl);
  } catch {
    return;
  }

  // updateMany no-ops if url+flag have diverged since fetch started; next edit re-triggers.
  for (const f of candidateFields) {
    const flag = flagOf(f);
    const newValue = parsed[OG_FIELD_TO_PARSED_KEY[f]] ?? null;
    await prisma.client.link
      .updateMany({
        where: {
          id: linkId,
          url: targetUrl,
          [flag]: false,
          deletedAt: null,
        },
        data: { [f]: newValue, [flag]: false },
      })
      .catch(() => {});
  }

  // del-only (no prime): a concurrent crawler set could clobber us last-write-wins; bounded 24h staleness is accepted.
  if (redis.enabled) {
    const fresh = await prisma.client.link
      .findUnique({ where: { id: linkId }, select: { slug: true } })
      .catch(() => null);
    if (fresh?.slug) {
      await redis.client.del(`link:${fresh.slug}`).catch(() => {});
    }
  }
}

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
  applyOgIntent(data);

  const result = await prisma.client.link.create({ data });

  // Slug may be reused after a hard-delete; clear any stale redirect cache.
  if (redis.enabled && result.slug) {
    await redis.client.del(`link:${result.slug}`);
  }

  return result;
}

export async function updateLink(linkId: string, data: any) {
  // Returned to caller for OG manual-flag check, Redis invalidation, and backfill race guards.
  const before = await prisma.client.link.findUnique({
    where: { id: linkId },
    select: {
      slug: true,
      url: true,
      ogTitleManual: true,
      ogDescriptionManual: true,
      ogImageManual: true,
    },
  });

  applyOgIntent(data, before);

  const result = await prisma.client.link.update({ where: { id: linkId }, data });

  if (redis.enabled) {
    if (before?.slug) await redis.client.del(`link:${before.slug}`);
    if (result.slug && result.slug !== before?.slug) {
      await redis.client.del(`link:${result.slug}`);
    }
  }

  return { result, before };
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
