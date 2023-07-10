import { Prisma, Report } from '@prisma/client';
import prisma from 'lib/prisma';

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

export async function getReports(where: Prisma.ReportWhereInput): Promise<Report[]> {
  return prisma.client.report.findMany({
    where,
  });
}

export async function updateReport(
  data: Prisma.ReportUpdateInput,
  where: Prisma.ReportWhereUniqueInput,
): Promise<Report> {
  return prisma.client.report.update({ data, where });
}

export async function deleteReport(where: Prisma.ReportWhereUniqueInput): Promise<Report> {
  return prisma.client.report.delete({ where });
}
