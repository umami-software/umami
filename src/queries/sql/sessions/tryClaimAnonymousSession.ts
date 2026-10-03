import clickhouse from '@/lib/clickhouse';
import kafka from '@/lib/kafka';
import prisma, { getSchema } from '@/lib/prisma';
import redis from '@/lib/redis';
import { truncateString } from '@/lib/format';
import { FIELD_LENGTH } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';

const FUNCTION_NAME = 'tryClaimAnonymousSession';

interface TryClaimAnonymousSessionArgs {
  websiteId: string;
  sessionId: string;
  distinctId: string;
  createdAt: Date;
}

async function relationalQuery({
  websiteId,
  sessionId,
  distinctId,
  createdAt,
}: TryClaimAnonymousSessionArgs): Promise<boolean> {
  const { transaction } = prisma;
  const truncatedDistinctId = truncateString(distinctId, FIELD_LENGTH.distinctId);

  // We use an interactive transaction to achieve true atomicity on PostgreSQL.
  // The transaction allows us to lock the session logic using a session-specific
  // advisory lock, check both tables, and conditionally insert without TOCTOU races.
  return transaction(async (tx: any) => {
    // FIX: Set search_path inside the interactive transaction if a custom schema is configured.
    const schema = getSchema();
    if (schema) {
      await tx.$executeRawUnsafe(`SET search_path TO "${schema}";`);
    }

    // 1. Acquire a transaction-level advisory lock based on the session ID.
    // This serializes all concurrent claims for this specific session.
    await tx.$executeRawUnsafe(
      `select pg_advisory_xact_lock(('x' || substr(replace($1, '-', ''), 1, 16))::bit(64)::bigint)`,
      sessionId,
    );

    // 2. Check session_link (the primary source of truth).
    const existingLinks: any[] = await tx.$queryRawUnsafe(
      `
      select distinct_id as "distinctId"
      from session_link
      where website_id = $1::uuid
        and session_id = $2::uuid
      `,
      websiteId,
      sessionId,
    );

    // 3. Check session.distinct_id (in case saveSessionLink previously failed but updateSession succeeded).
    const sessionRow: any[] = await tx.$queryRawUnsafe(
      `
      select distinct_id as "distinctId"
      from session
      where website_id = $1::uuid
        and session_id = $2::uuid
      `,
      websiteId,
      sessionId,
    );

    // Combine any identities found in either table.
    const existingIds = [
      ...existingLinks.map(r => r.distinctId),
      ...(sessionRow.length > 0 && sessionRow[0].distinctId ? [sessionRow[0].distinctId] : []),
    ];

    // If no other identity has claimed it, or if all claims are by this exact identity, we can reuse it.
    const canReuse = existingIds.length === 0 || existingIds.every(id => id === truncatedDistinctId);

    // 4. If it's safe to reuse, claim it by inserting the link.
    if (canReuse) {
      await tx.$executeRawUnsafe(
        `
        insert into session_link (website_id, session_id, distinct_id, created_at)
        values ($1::uuid, $2::uuid, $3, $4)
        on conflict (website_id, distinct_id, session_id) do nothing
        `,
        websiteId,
        sessionId,
        truncatedDistinctId,
        createdAt,
      );
    }

    return canReuse;
  }) as unknown as Promise<boolean>;
}

async function clickhouseQuery({
  websiteId,
  sessionId,
  distinctId,
  createdAt,
}: TryClaimAnonymousSessionArgs): Promise<boolean> {
  const { rawQuery, insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const truncatedDistinctId = truncateString(distinctId, FIELD_LENGTH.distinctId);
  const lockKey = `lock:session_claim:${sessionId}`;
  let hasLock = false;

  // FIX: Use Redis distributed lock for ClickHouse concurrency if available.
  // ClickHouse is eventually consistent, so concurrent identities need an external mutex.
  if (redis.enabled) {
    try {
      await redis.client.connect();
      // Set NX with a 5000ms expiry
      const lockRes = await redis.client.client.set(lockKey, '1', { NX: true, PX: 5000 });
      if (!lockRes) {
        // If we can't acquire the lock, another identity is concurrently claiming it.
        // We refuse to reuse it to prevent mixing activity.
        return false;
      }
      hasLock = true;
    } catch (e) {
      // Ignore lock errors, fallback to best-effort
    }
  }

  try {
    const existing = (await rawQuery(
      `
      select distinct distinct_id as distinctId
      from session_link
      where website_id = {websiteId:UUID}
        and session_id = {sessionId:UUID}
      `,
      { websiteId, sessionId },
      FUNCTION_NAME,
    )) as { distinctId: string }[];

    const existingIds = existing.map(r => r.distinctId);
    const canReuse = existingIds.length === 0 || existingIds.every(id => id === truncatedDistinctId);

    if (canReuse) {
      const message = {
        website_id: websiteId,
        session_id: sessionId,
        distinct_id: truncatedDistinctId,
        created_at: getUTCString(createdAt),
      };

      if (kafka.enabled) {
        await sendMessage('session_link', [message]);
      } else {
        await insert('session_link', [message]);
      }
    }

    return canReuse;
  } finally {
    if (hasLock && redis.enabled) {
      try {
        await redis.client.del(lockKey);
      } catch (e) {
        // Best effort cleanup
      }
    }
  }
}

export default function tryClaimAnonymousSession(
  args: TryClaimAnonymousSessionArgs,
): Promise<boolean> {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}
