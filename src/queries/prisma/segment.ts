import prisma from '@/lib/prisma';
import { Prisma, Segment } from '@prisma/client';

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

export async function getWebsiteSegment(websiteId: string, segmentId: string): Promise<Segment> {
  return prisma.client.Segment.findFirst({
    where: { id: segmentId, websiteId },
  });
}

export async function getWebsiteSegments(websiteId: string, type: string): Promise<Segment[]> {
  return prisma.pagedQuery('segment', {
    where: { websiteId, type },
  });
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
