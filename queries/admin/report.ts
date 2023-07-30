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

export async function getUserReports(userId: string): Promise<Report[]> {
  return prisma.client.report.findMany({
    where: {
      userId,
    },
  });
}

export async function getWebsiteReports(websiteId: string): Promise<Report[]> {
  return prisma.client.report.findMany({
    where: {
      websiteId,
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
