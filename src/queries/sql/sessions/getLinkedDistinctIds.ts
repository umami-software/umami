import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getLinkedDistinctIds';

export async function getLinkedDistinctIds(
  ...args: [websiteId: string, sessionId: string]
): Promise<string[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, sessionId: string): Promise<string[]> {
  const { rawQuery } = prisma;

  return rawQuery(
    `
    select distinct distinct_id as "distinctId"
    from session_link
    where website_id = {{websiteId::uuid}}
      and session_id = {{sessionId::uuid}}
    `,
    { websiteId, sessionId },
    FUNCTION_NAME,
  ).then(result => (result as { distinctId: string }[]).map(({ distinctId }) => distinctId));
}

async function clickhouseQuery(websiteId: string, sessionId: string): Promise<string[]> {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select distinct distinct_id as distinctId
    from session_link
    where website_id = {websiteId:UUID}
      and session_id = {sessionId:UUID}
    `,
    { websiteId, sessionId },
    FUNCTION_NAME,
  ).then(result => (result as { distinctId: string }[]).map(({ distinctId }) => distinctId));
}
