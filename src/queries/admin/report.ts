import { Prisma, Report } from '@prisma/client';
import prisma from 'lib/prisma';
import { PageResult, PageParams } from 'lib/types';
import ReportFindManyArgs = Prisma.ReportFindManyArgs;

async function findReport(criteria: Prisma.ReportFindUniqueArgs): Promise<Report> {
  return prisma.client.report.findUnique(criteria);
}

export async function getReport(reportId: string): Promise<Report> {
  return findReport({
    where: {
      id: reportId,
    },
  });
}

export async function getReports(
  criteria: ReportFindManyArgs,
  filters: PageParams = {},
): Promise<PageResult<Report[]>> {
  const { query } = filters;

  const where: Prisma.ReportWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(query, [
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

export async function getUserReports(
  userId: string,
  filters?: PageParams,
): Promise<PageResult<Report[]>> {
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

export async function getWebsiteReports(
  websiteId: string,
  filters: PageParams = {},
): Promise<PageResult<Report[]>> {
  return getReports(
    {
      where: {
        websiteId,
      },
    },
    filters,
  );
}

export async function createReport(data: Prisma.ReportUncheckedCreateInput): Promise<Report> {
  return prisma.client.report.create({ data });
}

export async function updateReport(
  reportId: string,
  data: Prisma.ReportUpdateInput,
): Promise<Report> {
  return prisma.client.report.update({ where: { id: reportId }, data });
}

export async function deleteReport(reportId: string): Promise<Report> {
  return prisma.client.report.delete({ where: { id: reportId } });
}
