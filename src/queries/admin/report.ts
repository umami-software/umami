import { Prisma, Report } from '@prisma/client';
import prisma from 'lib/prisma';
import { FilterResult, ReportSearchFilter } from 'lib/types';
import ReportFindUniqueArgs = Prisma.ReportFindUniqueArgs;
import ReportFindManyArgs = Prisma.ReportFindManyArgs;

async function findReport(criteria: ReportFindUniqueArgs) {
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
  filters: ReportSearchFilter = {},
): Promise<FilterResult<Report[]>> {
  const mode = prisma.getQueryMode();
  const { query, userId, websiteId } = filters;

  const where: Prisma.ReportWhereInput = {
    ...criteria.where,
    userId,
    websiteId,
    AND: [
      {
        OR: [
          {
            userId,
          },
        ],
      },
      {
        OR: [
          {
            name: {
              contains: query,
              mode,
            },
          },
          {
            description: {
              contains: query,
              mode,
            },
          },
          {
            type: {
              contains: query,
              mode,
            },
          },
          {
            user: {
              username: {
                contains: query,
                mode,
              },
            },
          },
          {
            website: {
              name: {
                contains: query,
                mode,
              },
            },
          },
          {
            website: {
              domain: {
                contains: query,
                mode,
              },
            },
          },
        ],
      },
    ],
  };

  return prisma.pagedQuery('report', { where }, filters);
}

export async function getUserReports(
  userId: string,
  filters?: ReportSearchFilter,
): Promise<FilterResult<Report[]>> {
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
  filters: ReportSearchFilter = {},
): Promise<FilterResult<Report[]>> {
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
