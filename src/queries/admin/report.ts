import { Prisma, Report } from '@prisma/client';
import { REPORT_FILTER_TYPES } from 'lib/constants';
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
  ReportSearchFilter: ReportSearchFilter,
  options?: { include?: Prisma.ReportInclude },
): Promise<FilterResult<Report[]>> {
  const {
    userId,
    websiteId,
    includeTeams,
    filter,
    filterType = REPORT_FILTER_TYPES.all,
  } = ReportSearchFilter;

  const mode = prisma.getSearchMode();

  const where: Prisma.ReportWhereInput = {
    ...(userId && { userId: userId }),
    ...(websiteId && { websiteId: websiteId }),
    AND: [
      {
        OR: [
          {
            ...(userId && { userId: userId }),
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
            ...((filterType === REPORT_FILTER_TYPES.all ||
              filterType === REPORT_FILTER_TYPES.name) && {
              name: {
                startsWith: filter,
                ...mode,
              },
            }),
          },
          {
            ...((filterType === REPORT_FILTER_TYPES.all ||
              filterType === REPORT_FILTER_TYPES.description) && {
              description: {
                startsWith: filter,
                ...mode,
              },
            }),
          },
          {
            ...((filterType === REPORT_FILTER_TYPES.all ||
              filterType === REPORT_FILTER_TYPES.type) && {
              type: {
                startsWith: filter,
                ...mode,
              },
            }),
          },
          {
            ...((filterType === REPORT_FILTER_TYPES.all ||
              filterType === REPORT_FILTER_TYPES['user:username']) && {
              user: {
                username: {
                  startsWith: filter,
                  ...mode,
                },
              },
            }),
          },
          {
            ...((filterType === REPORT_FILTER_TYPES.all ||
              filterType === REPORT_FILTER_TYPES['website:name']) && {
              website: {
                name: {
                  startsWith: filter,
                  ...mode,
                },
              },
            }),
          },
          {
            ...((filterType === REPORT_FILTER_TYPES.all ||
              filterType === REPORT_FILTER_TYPES['website:domain']) && {
              website: {
                domain: {
                  startsWith: filter,
                  ...mode,
                },
              },
            }),
          },
        ],
      },
    ],
  };

  const [pageFilters, getParameters] = prisma.getPageFilters(ReportSearchFilter);

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
    ...getParameters,
  };
}

export async function getReportsByUserId(
  userId: string,
  filter: ReportSearchFilter,
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
