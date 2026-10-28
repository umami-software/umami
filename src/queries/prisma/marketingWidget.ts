import prisma from '@/lib/prisma';

export async function getWebsiteWidgets(websiteId: string) {
  return prisma.client.marketingWidget.findMany({
    where: { websiteId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getEnabledWidgets(websiteId: string) {
  return prisma.client.marketingWidget.findMany({
    where: { websiteId, enabled: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getWidget(widgetId: string) {
  return prisma.client.marketingWidget.findUnique({ where: { id: widgetId } });
}

export async function createWidget(data: {
  id: string;
  websiteId: string;
  type: string;
  name: string;
  enabled: boolean;
  config: object;
  delivery: object;
}) {
  return prisma.client.marketingWidget.create({ data });
}

export async function updateWidget(
  widgetId: string,
  data: { name?: string; enabled?: boolean; config?: object; delivery?: object },
) {
  return prisma.client.marketingWidget.update({ where: { id: widgetId }, data });
}

export async function deleteWidget(widgetId: string) {
  return prisma.client.marketingWidget.delete({ where: { id: widgetId } });
}

export async function createLead(data: {
  id: string;
  widgetId: string;
  websiteId: string;
  data: object;
  pageUrl?: string;
}) {
  return prisma.client.lead.create({ data });
}

export async function setLeadDelivery(leadId: string, deliveryStatus: object) {
  return prisma.client.lead.update({ where: { id: leadId }, data: { deliveryStatus } });
}

export async function getWebsiteLeads(websiteId: string, page = 1, pageSize = 50) {
  const [data, count] = await Promise.all([
    prisma.client.lead.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { widget: { select: { name: true, type: true } } },
    }),
    prisma.client.lead.count({ where: { websiteId } }),
  ]);
  return { data, count, page, pageSize };
}

export async function deleteLead(leadId: string) {
  return prisma.client.lead.delete({ where: { id: leadId } });
}

export async function getLead(leadId: string) {
  return prisma.client.lead.findUnique({ where: { id: leadId } });
}
