import clickhouse from '@/lib/clickhouse';
import { FIELD_LENGTH } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import kafka from '@/lib/kafka';
import prisma, { getSchema } from '@/lib/prisma';
import redis from '@/lib/redis';

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
    const canReuse =
      existingIds.length === 0 || existingIds.every(id => id === truncatedDistinctId);

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

// Long enough to outlive any queued (Kafka) session_link write, after which the
// ClickHouse check below also sees the claim.
const CLAIM_TTL_SECONDS = 86400;

async function clickhouseQuery({
  websiteId,
  sessionId,
  distinctId,
  createdAt,
}: TryClaimAnonymousSessionArgs): Promise<boolean> {
  // ClickHouse cannot check-and-insert atomically, and Kafka writes land later still.
  // Without Redis there is nowhere to make the claim atomically, so decline reuse
  // rather than risk two identities sharing one session.
  if (!redis.enabled) {
    return false;
  }

  const { rawQuery, insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const truncatedDistinctId = truncateString(distinctId, FIELD_LENGTH.distinctId);

  // Claims already persisted in ClickHouse (including any older than the Redis claim).
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

  if (existing.some(r => r.distinctId !== truncatedDistinctId)) {
    return false;
  }

  // The Redis key is the claim itself: SET NX checks and saves in one step, so
  // only one identity can ever own the session, even before its ClickHouse row lands.
  await redis.client.connect();

  const claimKey = `session:claim:${websiteId}:${sessionId}`;
  const claimed = await redis.client.client.set(claimKey, truncatedDistinctId, {
    NX: true,
    EX: CLAIM_TTL_SECONDS,
  });

  if (!claimed) {
    const owner = await redis.client.client.get(claimKey);

    if (owner !== truncatedDistinctId) {
      return false;
    }
  }

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

  return true;
}

export function tryClaimAnonymousSession(args: TryClaimAnonymousSessionArgs): Promise<boolean> {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}
