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
  const { writeRawQuery } = prisma;

  // This query atomically checks and claims in one statement:
  //
  // 1. The UPDATE clause attempts to claim the session row by setting its distinct_id,
  //    but only if it is currently unclaimed (null) or already claimed by us.
  //    Concurrent threads with different distinctIds will serialize on the row lock.
  //
  // 2. The INSERT clause writes the link, but only if the claim CTE succeeded.
  //    ON CONFLICT handles idempotency if the link already exists.
  //
  // 3. We SELECT whether the claim succeeded. If it did, we own the session.
  //    If it failed (another identity snuck in or row missing), we return false.
  const truncatedDistinctId = truncateString(distinctId, FIELD_LENGTH.distinctId);

  const result = (await writeRawQuery(
    `
    with claim as (
      update session
      set distinct_id = {{distinctId}}
      where website_id = {{websiteId}}::uuid
        and session_id = {{sessionId}}::uuid
        and coalesce(distinct_id, {{distinctId}}) = {{distinctId}}
      returning 1
    ),
    link as (
      insert into session_link (website_id, session_id, distinct_id, created_at)
      select {{websiteId}}::uuid, {{sessionId}}::uuid, {{distinctId}}, {{createdAt}}
      from claim
      on conflict (website_id, distinct_id, session_id) do nothing
      returning 1
    )
    select exists (
      select 1 from claim
    ) as "canReuse"
    `,
    {
      websiteId,
      sessionId,
      distinctId: truncatedDistinctId,
      createdAt,
    },
    FUNCTION_NAME,
  )) as { canReuse: boolean }[];

  return result[0]?.canReuse ?? false;
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
