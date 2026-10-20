import clickhouse from '@/lib/clickhouse';
import { FIELD_LENGTH } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
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
    [CLICKHOUSE]: () => clickhouseQuery(data),
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

export async function clickhouseQuery(data: SaveRevenueArgs) {
  const { websiteId, sessionId, eventId, eventName, currency, revenue, createdAt } = data;
  const { insert, getUTCString } = clickhouse;

  await insert('website_revenue', [
    {
      website_id: websiteId,
      session_id: sessionId,
      event_id: eventId,
      event_name: truncateString(eventName, FIELD_LENGTH.eventName) ?? '',
      currency: truncateString(currency, FIELD_LENGTH.currency) ?? '',
      revenue,
      created_at: getUTCString(createdAt),
    },
  ]);
}
