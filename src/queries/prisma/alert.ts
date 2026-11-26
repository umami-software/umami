import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export async function getWebsiteAlertRules(websiteId: string) {
  return prisma.client.alertRule.findMany({
    where: { websiteId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAlertRule(alertRuleId: string) {
  return prisma.client.alertRule.findUnique({
    where: { id: alertRuleId },
  });
}

export async function createAlertRule(data: Prisma.AlertRuleUncheckedCreateInput) {
  return prisma.client.alertRule.create({
    data,
  });
}

export async function updateAlertRule(
  alertRuleId: string,
  data: Prisma.AlertRuleUncheckedUpdateInput,
) {
  return prisma.client.alertRule.update({
    where: { id: alertRuleId },
    data,
  });
}

export async function deleteAlertRule(alertRuleId: string) {
  return prisma.client.alertRule.delete({
    where: { id: alertRuleId },
  });
}

export async function createAlertNotification(data: Prisma.AlertNotificationUncheckedCreateInput) {
  return prisma.client.alertNotification.create({
    data,
  });
}

export async function getWebsiteAlertNotifications(
  websiteId: string,
  options: { page?: number; pageSize?: number } = {},
) {
  const { page = 1, pageSize = 20 } = options;
  const skip = (page - 1) * pageSize;

  const [data, count] = await Promise.all([
    prisma.client.alertNotification.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.client.alertNotification.count({
      where: { websiteId },
    }),
  ]);

  return { data, count, page, pageSize };
}
