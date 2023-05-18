import { Prisma, UserReport } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createUserReport(
  data: Prisma.UserReportUncheckedCreateInput,
): Promise<UserReport> {
  return prisma.client.userReport.create({ data });
}

export async function getUserReportById(userReportId: string): Promise<UserReport> {
  return prisma.client.userReport.findUnique({
    where: {
      id: userReportId,
    },
  });
}

export async function getUserReports(userId: string): Promise<UserReport[]> {
  return prisma.client.userReport.findMany({
    where: {
      userId,
    },
  });
}

export async function updateUserReport(
  data: Prisma.UserReportUpdateInput,
  where: Prisma.UserReportWhereUniqueInput,
): Promise<UserReport> {
  return prisma.client.userReport.update({ data, where });
}

export async function deleteUserReport(
  where: Prisma.UserReportWhereUniqueInput,
): Promise<UserReport> {
  return prisma.client.userReport.delete({ where });
}
