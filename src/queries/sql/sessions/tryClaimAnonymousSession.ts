import clickhouse from '@/lib/clickhouse';
import { FIELD_LENGTH } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'tryClaimAnonymousSession';

export interface TryClaimAnonymousSessionArgs {
  websiteId: string;
  sessionId: string;
  distinctId: string;
  createdAt?: Date;
}

export async function tryClaimAnonymousSession(
  data: TryClaimAnonymousSessionArgs,
): Promise<boolean> {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(data),
  });
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
  // advisory lock, check the link table, and conditionally insert without TOCTOU races.
  return transaction(async (tx: any) => {
    // 1. Acquire a transaction-level advisory lock based on the session ID.
    // This serializes all concurrent claims for this specific session, guaranteeing
    // that the read-then-write logic below is 100% free of TOCTOU race conditions.
    // We convert the UUID into a 64-bit integer by taking the first 16 hex characters.
    await tx.$executeRawUnsafe(
      `select pg_advisory_xact_lock(('x' || substr(replace($1, '-', ''), 1, 16))::bit(64)::bigint)`,
      sessionId,
    );

    // 2. Now holding the lock, check session_link (the single source of truth)
    // to see if the session is unclaimed or already claimed by this exact identity.
    // We do NOT rely on session.distinct_id because it can be out of sync if
    // a previous best-effort updateSession failed.
    const existing: any[] = await tx.$queryRawUnsafe(
      `
      select distinct_id as "distinctId"
      from session_link
      where website_id = $1::uuid
        and session_id = $2::uuid
      `,
      websiteId,
      sessionId,
    );

    const existingIds = existing.map(r => r.distinctId);
    const canReuse = existingIds.length === 0 || existingIds.every(id => id === truncatedDistinctId);

    // 3. If it's safe to reuse, claim it by inserting the link.
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
}
