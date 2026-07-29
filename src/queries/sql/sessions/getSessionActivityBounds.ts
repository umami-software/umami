import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getSessionActivityBounds';

interface SessionActivityBounds {
  firstAt: string | Date;
  lastAt: string | Date;
}

export async function getSessionActivityBounds(
  ...args: [websiteId: string, sessionIds: string[]]
): Promise<SessionActivityBounds | null> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  sessionIds: string[],
): Promise<SessionActivityBounds | null> {
  const { rawQuery } = prisma;

  return rawQuery(
    `
    select
      min(created_at) as "firstAt",
      max(created_at) as "lastAt"
    from website_event
    where website_id = {{websiteId::uuid}}
      and session_id = any({{sessionIds}}::uuid[])
      and event_type != ${EVENT_TYPE.performance}
    `,
    { websiteId, sessionIds },
    FUNCTION_NAME,
  ).then(result => (result?.[0]?.firstAt && result?.[0]?.lastAt ? result[0] : null));
}

async function clickhouseQuery(
  websiteId: string,
  sessionIds: string[],
): Promise<SessionActivityBounds | null> {
  const { rawQuery, getDateStringSQL } = clickhouse;

  return rawQuery(
    `
    select
      ${getDateStringSQL('min(created_at)')} as firstAt,
      ${getDateStringSQL('max(created_at)')} as lastAt
    from website_event
    where website_id = {websiteId:UUID}
      and session_id in {sessionIds:Array(UUID)}
      and event_type != ${EVENT_TYPE.performance}
    `,
    { websiteId, sessionIds },
    FUNCTION_NAME,
  ).then(result => (result?.[0]?.firstAt && result?.[0]?.lastAt ? result[0] : null));
}
