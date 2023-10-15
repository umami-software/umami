import { Prisma, Report } from '@prisma/client';
import prisma from 'lib/prisma';
import { FilterResult, ReportSearchFilter } from 'lib/types';

export async function createReport(data: Prisma.ReportUncheckedCreateInput): Promise<Report> {
  return prisma.client.report.create({ data });
}

export async function getReportById(reportId: string): Promise<Report> {
  return prisma.client.report.findUnique({
    where: {
      id: reportId,
    },
  });
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

export async function getReports(
  params: ReportSearchFilter,
  options?: { include?: Prisma.ReportInclude },
): Promise<FilterResult<Report[]>> {
  const { query, userId, websiteId, includeTeams } = params;

  const mode = prisma.getSearchMode();

  const where: Prisma.ReportWhereInput = {
    userId,
    websiteId,
    AND: [
      {
        OR: [
          {
            userId,
          },
          {
            ...(includeTeams && {
              website: {
                teamWebsite: {
                  some: {
                    team: {
                      teamUser: {
                        some: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            }),
          },
        ],
      },
      {
        OR: [
          {
            name: {
              contains: query,
              ...mode,
            },
          },
          {
            description: {
              contains: query,
              ...mode,
            },
          },
          {
            type: {
              contains: query,
              ...mode,
            },
          },
          {
            user: {
              username: {
                contains: query,
                ...mode,
              },
            },
          },
          {
            website: {
              name: {
                contains: query,
                ...mode,
              },
            },
          },
          {
            website: {
              domain: {
                contains: query,
                ...mode,
              },
            },
          },
        ],
      },
    ],
  };

  const [pageFilters, pageInfo] = prisma.getPageFilters(params);

  const reports = await prisma.client.report.findMany({
    where,
    ...pageFilters,
    ...(options?.include && { include: options.include }),
  });

  const count = await prisma.client.report.count({
    where,
  });

  return {
    data: reports,
    count,
    ...pageInfo,
  };
}

export async function getReportsByUserId(
  userId: string,
  filter?: ReportSearchFilter,
): Promise<FilterResult<Report[]>> {
  return getReports(
    { userId, ...filter },
    {
      include: {
        website: {
          select: {
            domain: true,
            userId: true,
          },
        },
      },
    },
  );
}

export async function getReportsByWebsiteId(
  websiteId: string,
  filter: ReportSearchFilter,
): Promise<FilterResult<Report[]>> {
  return getReports({ websiteId, ...filter });
}
