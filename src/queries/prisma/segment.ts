import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { QueryFilters } from '@/lib/types';

async function findSegment(criteria: Prisma.SegmentFindUniqueArgs) {
  return prisma.client.segment.findUnique(criteria);
}

export async function getSegment(segmentId: string) {
  return findSegment({
    where: {
      id: segmentId,
    },
  });
}

export async function getSegments(criteria: Prisma.SegmentFindManyArgs, filters: QueryFilters) {
  const { search } = filters;
  const { getSearchParameters, pagedQuery } = prisma;

  const where: Prisma.SegmentWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [
      {
        name: 'contains',
      },
    ]),
  };

  return pagedQuery('segment', { ...criteria, where }, filters);
}

export async function getWebsiteSegment(websiteId: string, segmentId: string) {
  return prisma.client.segment.findFirst({
    where: { id: segmentId, websiteId },
  });
}

export async function getWebsiteSegments(websiteId: string, type: string, filters?: QueryFilters) {
  return getSegments(
    {
      where: {
        websiteId,
        type,
      },
    },
    filters,
  );
}

export async function createSegment(data: Prisma.SegmentUncheckedCreateInput) {
  return prisma.client.segment.create({ data });
}

export async function updateSegment(SegmentId: string, data: Prisma.SegmentUpdateInput) {
  return prisma.client.segment.update({ where: { id: SegmentId }, data });
}

export async function deleteSegment(SegmentId: string) {
  return prisma.client.segment.delete({ where: { id: SegmentId } });
}
