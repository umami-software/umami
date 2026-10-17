import clickhouse from '@/lib/clickhouse';
import { FIELD_LENGTH } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';

export interface SaveEngagementArgs {
  websiteId: string;
  sessionId: string;
  visitId: string;
  urlPath: string;
  engagementTime: number;
  createdAt: Date;
}

export async function saveEngagement(args: SaveEngagementArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery({
  websiteId,
  sessionId,
  visitId,
  urlPath,
  engagementTime,
  createdAt,
}: SaveEngagementArgs) {
  return prisma.client.websiteEngagement.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      visitId,
      urlPath: truncateString(urlPath, FIELD_LENGTH.url),
      engagementTime,
      createdAt,
    },
  });
}

async function clickhouseQuery({
  websiteId,
  sessionId,
  visitId,
  urlPath,
  engagementTime,
  createdAt,
}: SaveEngagementArgs) {
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const message = {
    website_id: websiteId,
    session_id: sessionId,
    visit_id: visitId,
    url_path: truncateString(urlPath, FIELD_LENGTH.url),
    engagement_time: engagementTime,
    created_at: getUTCString(createdAt),
  };

  if (kafka.enabled) {
    return sendMessage('website_engagement', message);
  }

  return insert('website_engagement', [message]);
}
