import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export async function getWebsiteFilterRules(websiteId: string) {
  return prisma.client.websiteFilterRule.findMany({
    where: { websiteId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveWebsiteFilterRules(websiteId: string) {
  return prisma.client.websiteFilterRule.findMany({
    where: {
      websiteId,
      isEnabled: true,
    },
    select: {
      id: true,
      type: true,
      value: true,
      action: true,
    },
  });
}

export async function getFilterRule(ruleId: string) {
  return prisma.client.websiteFilterRule.findUnique({
    where: { id: ruleId },
  });
}

export async function createFilterRule(data: Prisma.WebsiteFilterRuleUncheckedCreateInput) {
  return prisma.client.websiteFilterRule.create({
    data,
  });
}

export async function updateFilterRule(
  ruleId: string,
  data: Prisma.WebsiteFilterRuleUncheckedUpdateInput,
) {
  return prisma.client.websiteFilterRule.update({
    where: { id: ruleId },
    data,
  });
}

export async function deleteFilterRule(ruleId: string) {
  return prisma.client.websiteFilterRule.delete({
    where: { id: ruleId },
  });
}
