import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';
import ReportFindManyArgs = Prisma.ReportFindManyArgs;

async function findReport(criteria: Prisma.ReportFindUniqueArgs) {
  return prisma.client.report.findUnique(criteria);
}

export async function getReport(reportId: string) {
  return findReport({
    where: {
      id: reportId,
    },
  });
}

export async function getReports(criteria: ReportFindManyArgs, filters: QueryFilters = {}) {
  const { search } = filters;

  const where: Prisma.ReportWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [
      { name: 'contains' },
      { description: 'contains' },
      { type: 'contains' },
      {
        user: {
          username: 'contains',
        },
      },
      {
        website: {
          name: 'contains',
        },
      },
      {
        website: {
          domain: 'contains',
        },
      },
    ]),
  };

  return prisma.pagedQuery('report', { ...criteria, where }, filters);
}

export async function getUserReports(userId: string, filters?: QueryFilters) {
  return getReports(
    {
      where: {
        userId,
      },
      include: {
        website: {
          select: {
            domain: true,
            userId: true,
          },
        },
      },
    },
    filters,
  );
}

export async function getWebsiteReports(websiteId: string, filters: QueryFilters = {}) {
  return getReports(
    {
      where: {
        websiteId,
      },
    },
    filters,
  );
}

export async function createReport(data: Prisma.ReportUncheckedCreateInput) {
  return prisma.client.report.create({ data });
}

export async function updateReport(reportId: string, data: any) {
  return prisma.client.report.update({ where: { id: reportId }, data });
}

export async function deleteReport(reportId: string) {
  return prisma.client.report.delete({ where: { id: reportId } });
}
