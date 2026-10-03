import type { Prisma } from '@/generated/prisma/client';
import clickhouse from '@/lib/clickhouse';
import { normalizeError } from '@/lib/errors/normalize';
import type { ErrorPayload } from '@/lib/errors/schema';
import prisma from '@/lib/prisma';

export async function consumeErrorQuota(websiteId: string) {
  const configured = Number(process.env.ERRORS_PER_MINUTE || 120);
  const limit =
    Number.isSafeInteger(configured) && configured > 0 ? Math.min(configured, 100000) : 120;
  const rows = await prisma.writeRawQuery(
    `insert into error_rate_limit (website_id, bucket, count)
     values ({{websiteId::uuid}}, date_trunc('minute', now()), 1)
     on conflict (website_id) do update set
       bucket = excluded.bucket,
       count = case when error_rate_limit.bucket = excluded.bucket
         then least(error_rate_limit.count + 1, {{limit}} + 1) else 1 end
     returning count`,
    { websiteId, limit },
  );
  return Number(rows[0].count) <= limit;
}

export async function saveError(
  payload: ErrorPayload,
  context: { sessionId: string; visitId: string; browser?: string; os?: string; device?: string },
) {
  const { issueId, fingerprint, ...normalized } = normalizeError(payload);
  const issue = {
    id: issueId,
    websiteId: payload.website,
    fingerprint,
    title: `${normalized.name}: ${normalized.message}`.slice(0, 2200),
  };
  const event = {
    ...normalized,
    id: payload.eventId,
    websiteId: payload.website,
    issueId,
    sessionId: context.sessionId,
    visitId: context.visitId,
    createdAt: new Date(payload.timestamp),
    receivedAt: new Date(),
    handled: payload.handled,
    browser: (context.browser || '').slice(0, 50),
    os: (context.os || '').slice(0, 50),
    device: (context.device || '').slice(0, 50),
  };
  if (!clickhouse.enabled) {
    await prisma.transaction(async (tx: Prisma.TransactionClient) => {
      // INSERT ON CONFLICT handles simultaneous first occurrences without an
      // ORM read-before-create race, and preserves existing workflow state.
      await tx.errorIssue.createMany({ data: [issue], skipDuplicates: true });
      await tx.errorEvent.createMany({
        data: [{ ...event, frames: event.frames.map(frame => ({ ...frame })) }],
        skipDuplicates: true,
      });
    });
  } else {
    // State exists before the event becomes visible. An interrupted dual write can
    // leave an empty issue; list queries only include issues with retained events.
    await prisma.client.errorIssue.createMany({ data: [issue], skipDuplicates: true });
    const { rawQuery, insert } = clickhouse;
    const existing = await rawQuery<any[]>(
      'select event_id from error_event final where website_id = {websiteId:UUID} and event_id = {eventId:UUID} limit 1',
      { websiteId: payload.website, eventId: payload.eventId },
    );
    if (!existing.length) {
      await insert('error_event', [
        {
          website_id: event.websiteId,
          event_id: event.id,
          issue_id: issueId,
          session_id: event.sessionId,
          visit_id: event.visitId,
          created_at: event.createdAt.toISOString().replace('T', ' ').replace('Z', ''),
          received_at: event.receivedAt.toISOString().replace('T', ' ').replace('Z', ''),
          name: event.name,
          message: event.message,
          stack: event.stack,
          frames: JSON.stringify(event.frames),
          tags: JSON.stringify(event.tags),
          handled: event.handled,
          url_path: event.urlPath,
          release: event.release,
          environment: event.environment,
          browser: event.browser,
          os: event.os,
          device: event.device,
        },
      ]);
    }
  }
  return { eventId: payload.eventId, issueId };
}

export async function deleteClickHouseErrors(websiteId: string, before?: Date) {
  if (!clickhouse.enabled) return;
  const client = await clickhouse.connect();
  await client.command({
    query: `ALTER TABLE error_event DELETE WHERE website_id = {websiteId:UUID}${before ? ' AND received_at < {before:DateTime64(3)}' : ''}`,
    query_params: {
      websiteId,
      ...(before ? { before: before.toISOString().replace('T', ' ').replace('Z', '') } : {}),
    },
    clickhouse_settings: { mutations_sync: '1' },
  });
}
