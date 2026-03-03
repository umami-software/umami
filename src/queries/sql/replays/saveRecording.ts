import { gzipSync } from 'node:zlib';
import clickhouse from '@/lib/clickhouse';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface SaveRecordingArgs {
  websiteId: string;
  sessionId: string;
  chunkIndex: number;
  events: any[];
  eventCount: number;
  startedAt: Date;
  endedAt: Date;
}

export async function saveRecording(args: SaveRecordingArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery({
  websiteId,
  sessionId,
  chunkIndex,
  events,
  eventCount,
  startedAt,
  endedAt,
}: SaveRecordingArgs) {
  const compressed = gzipSync(Buffer.from(JSON.stringify(events), 'utf-8'));

  return prisma.client.sessionReplay.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      chunkIndex,
      events: compressed as any,
      eventCount,
      startedAt,
      endedAt,
    },
  });
}

async function clickhouseQuery({
  websiteId,
  sessionId,
  chunkIndex,
  events,
  eventCount,
  startedAt,
  endedAt,
}: SaveRecordingArgs) {
  const { insert, getUTCString } = clickhouse;

  return insert('session_replay', [
    {
      replay_id: uuid(),
      website_id: websiteId,
      session_id: sessionId,
      chunk_index: chunkIndex,
      events: JSON.stringify(events),
      event_count: eventCount,
      started_at: getUTCString(startedAt),
      ended_at: getUTCString(endedAt),
    },
  ]);
}
