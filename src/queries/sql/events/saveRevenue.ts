import { FIELD_LENGTH } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import prisma from '@/lib/prisma';

export interface SaveRevenueArgs {
  websiteId: string;
  sessionId: string;
  eventId: string;
  eventName: string;
  currency: string;
  revenue: number;
  createdAt: Date;
}

export async function saveRevenue(data: SaveRevenueArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
  });
}

async function relationalQuery(data: SaveRevenueArgs) {
  const { websiteId, sessionId, eventId, eventName, currency, revenue, createdAt } = data;

  await prisma.client.revenue.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      eventId,
      eventName: truncateString(eventName, FIELD_LENGTH.eventName),
      currency: truncateString(currency, FIELD_LENGTH.currency),
      revenue,
      createdAt,
    },
  });
}
