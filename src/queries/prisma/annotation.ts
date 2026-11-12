import type { Annotation, Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import type { PageResult, QueryFilters } from '@/lib/types';

export async function getAnnotation(annotationId: string) {
  return prisma.client.annotation.findUnique({
    where: {
      id: annotationId,
    },
  });
}

export async function getWebsiteAnnotation(websiteId: string, annotationId: string) {
  return prisma.client.annotation.findFirst({
    where: { id: annotationId, websiteId },
  });
}

export async function getWebsiteAnnotations(
  websiteId: string,
  filters: QueryFilters & { startDate?: Date; endDate?: Date } = {},
): Promise<PageResult<Annotation[]>> {
  const { search, startDate, endDate } = filters;
  const { getSearchParameters, pagedQuery } = prisma;

  const where: Prisma.AnnotationWhereInput = {
    websiteId,
    ...(startDate &&
      endDate && {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }),
    ...getSearchParameters(search, [
      {
        note: 'contains',
      },
    ]),
  };

  return pagedQuery(
    'annotation',
    {
      where,
      orderBy: {
        date: 'desc',
      },
    },
    filters,
  );
}

export async function createAnnotation(data: Prisma.AnnotationUncheckedCreateInput) {
  return prisma.client.annotation.create({ data });
}

export async function updateAnnotation(annotationId: string, data: Prisma.AnnotationUpdateInput) {
  return prisma.client.annotation.update({ where: { id: annotationId }, data });
}

export async function deleteAnnotation(annotationId: string) {
  return prisma.client.annotation.delete({ where: { id: annotationId } });
}
