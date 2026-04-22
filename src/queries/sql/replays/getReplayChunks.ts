import { gunzipSync } from 'node:zlib';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getReplayChunks';

export interface ReplayChunk {
  sessionId: string;
  visitId: string;
  events: any[];
  chunkIndex: number;
  eventCount: number;
  startedAt: Date;
  endedAt: Date;
}

export async function getReplayChunks(websiteId: string, visitId: string): Promise<ReplayChunk[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(websiteId, visitId),
    [OCEANBASE]: () => oceanbaseQuery(websiteId, visitId),
    [CLICKHOUSE]: () => clickhouseQuery(websiteId, visitId),
  });
}

async function relationalQuery(websiteId: string, visitId: string): Promise<ReplayChunk[]> {
  const { rawQuery } = prisma;

  const chunks: {
    sessionId: string;
    visitId: string;
    events: Buffer;
    chunkIndex: number;
    eventCount: number;
    startedAt: Date;
    endedAt: Date;
  }[] = await rawQuery(
    `
    select
      session_id as "sessionId",
      visit_id as "visitId",
      events,
      chunk_index as "chunkIndex",
      event_count as "eventCount",
      started_at as "startedAt",
      ended_at as "endedAt"
    from session_replay
    where website_id = {{websiteId::uuid}}
      and visit_id = {{visitId::uuid}}
    order by chunk_index asc
    `,
    { websiteId, visitId },
    FUNCTION_NAME,
  );

  return chunks.map(chunk => ({
    ...chunk,
    events: JSON.parse(gunzipSync(Buffer.from(chunk.events)).toString('utf-8')),
  }));
}

async function clickhouseQuery(websiteId: string, visitId: string): Promise<ReplayChunk[]> {
  const { rawQuery } = clickhouse;

  const results = await rawQuery<
    {
      sessionId: string;
      visitId: string;
      events: string;
      chunk_index: number;
      event_count: number;
      started_at: string;
      ended_at: string;
    }[]
  >(
    `
    select
      session_id as sessionId,
      visit_id as visitId,
      events,
      chunk_index,
      event_count,
      started_at,
      ended_at
    from session_replay
    where website_id = {websiteId:UUID}
      and visit_id = {visitId:UUID}
    order by chunk_index asc
    `,
    { websiteId, visitId },
    FUNCTION_NAME,
  );

  return results.map(row => ({
    sessionId: row.sessionId,
    visitId: row.visitId,
    events: JSON.parse(row.events),
    chunkIndex: row.chunk_index,
    eventCount: row.event_count,
    startedAt: new Date(row.started_at),
    endedAt: new Date(row.ended_at),
  }));
}

async function oceanbaseQuery(websiteId: string, visitId: string): Promise<ReplayChunk[]> {
  const { rawQuery } = oceanbase;

  const chunks: {
    sessionId: string;
    visitId: string;
    events: Buffer;
    chunkIndex: number;
    eventCount: number;
    startedAt: Date;
    endedAt: Date;
  }[] = await rawQuery(
    `
    SELECT
      session_id AS sessionId,
      visit_id AS visitId,
      events,
      chunk_index AS chunkIndex,
      event_count AS eventCount,
      started_at AS startedAt,
      ended_at AS endedAt
    FROM session_replay
    WHERE website_id = ?
      AND visit_id = ?
    ORDER BY chunk_index ASC
    `,
    [websiteId, visitId],
    FUNCTION_NAME,
  );

  return chunks.map(chunk => ({
    ...chunk,
    events: JSON.parse(gunzipSync(Buffer.from(chunk.events)).toString('utf-8')),
  }));
}
