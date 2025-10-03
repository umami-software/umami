import prisma from '@/lib/prisma';
import { Prisma, Segment } from '@/generated/prisma/client';
import { PageResult, QueryFilters } from '@/lib/types';

async function findSegment(criteria: Prisma.SegmentFindUniqueArgs): Promise<Segment> {
  return prisma.client.Segment.findUnique(criteria);
}

export async function getSegment(segmentId: string): Promise<Segment> {
  return findSegment({
    where: {
      id: segmentId,
    },
  });
}

export async function getSegments(
  criteria: Prisma.SegmentFindManyArgs,
  filters: QueryFilters,
): Promise<PageResult<Segment[]>> {
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

export async function getWebsiteSegment(websiteId: string, segmentId: string): Promise<Segment> {
  return prisma.client.Segment.findFirst({
    where: { id: segmentId, websiteId },
  });
}

export async function getWebsiteSegments(
  websiteId: string,
  type: string,
  filters?: QueryFilters,
): Promise<PageResult<Segment[]>> {
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

export async function createSegment(data: Prisma.SegmentUncheckedCreateInput): Promise<Segment> {
  return prisma.client.Segment.create({ data });
}

export async function updateSegment(
  SegmentId: string,
  data: Prisma.SegmentUpdateInput,
): Promise<Segment> {
  return prisma.client.Segment.update({ where: { id: SegmentId }, data });
}

export async function deleteSegment(SegmentId: string): Promise<Segment> {
  return prisma.client.Segment.delete({ where: { id: SegmentId } });
}
