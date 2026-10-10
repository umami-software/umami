import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getReplayDistinctIds';

interface ReplayDistinctId {
  visitId: string;
  distinctId: string;
  linked: boolean | number;
}

export async function getReplayDistinctIds(
  websiteId: string,
  visitIds: string[],
): Promise<Record<string, string[]>> {
  if (!visitIds.length) {
    return {};
  }

  const rows: ReplayDistinctId[] = await runQuery({
    [PRISMA]: () => relationalQuery(websiteId, visitIds),
    [CLICKHOUSE]: () => clickhouseQuery(websiteId, visitIds),
  });

  // Same rule as the session details: linked IDs take precedence over the session's own ID.
  const linked: Record<string, Set<string>> = {};
  const own: Record<string, Set<string>> = {};

  for (const { visitId, distinctId, linked: isLinked } of rows) {
    const target = isLinked ? linked : own;
    target[visitId] ??= new Set();
    target[visitId].add(distinctId);
  }

  return Object.fromEntries(
    visitIds.map(visitId => [visitId, [...(linked[visitId] ?? own[visitId] ?? [])].sort()]),
  );
}

async function relationalQuery(websiteId: string, visitIds: string[]) {
  const { rawQuery } = prisma;

  return rawQuery(
    `
    select distinct sr.visit_id as "visitId", session_link.distinct_id as "distinctId", true as "linked"
    from session_replay sr
    join session_link on session_link.website_id = sr.website_id
      and session_link.session_id = sr.session_id
    where sr.website_id = {{websiteId::uuid}}
      and sr.visit_id = any({{visitIds}}::uuid[])
    union
    select distinct sr.visit_id as "visitId", session.distinct_id as "distinctId", false as "linked"
    from session_replay sr
    join session on session.website_id = sr.website_id
      and session.session_id = sr.session_id
    where sr.website_id = {{websiteId::uuid}}
      and sr.visit_id = any({{visitIds}}::uuid[])
      and session.distinct_id <> ''
    `,
    { websiteId, visitIds },
    FUNCTION_NAME,
  ) as Promise<ReplayDistinctId[]>;
}

async function clickhouseQuery(websiteId: string, visitIds: string[]) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select distinct session_replay.visit_id as visitId, session_link.distinct_id as distinctId, 1 as linked
    from session_replay
    join (
      select session_id, distinct_id
      from session_link
      where website_id = {websiteId:UUID}
    ) session_link on session_link.session_id = session_replay.session_id
    where session_replay.website_id = {websiteId:UUID}
      and session_replay.visit_id in {visitIds:Array(UUID)}
    union all
    select distinct visit_id as visitId, distinct_id as distinctId, 0 as linked
    from website_event
    where website_id = {websiteId:UUID}
      and visit_id in {visitIds:Array(UUID)}
      and distinct_id != ''
    `,
    { websiteId, visitIds },
    FUNCTION_NAME,
  ) as Promise<ReplayDistinctId[]>;
}
