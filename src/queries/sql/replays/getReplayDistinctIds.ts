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

  // website_event is sorted by time first, so a lookup by visit needs a time range to use the
  // index. Chunk times are server times, and the hour of margin covers a visit's events from
  // before its recording started.
  const visits = (await rawQuery(
    `
    select
      visit_id as visitId,
      any(session_id) as sessionId,
      toString(min(min(created_at)) over () - interval 1 hour) as startAt,
      toString(max(max(created_at)) over () + interval 1 hour) as endAt
    from session_replay
    where website_id = {websiteId:UUID}
      and visit_id in {visitIds:Array(UUID)}
    group by visit_id
    `,
    { websiteId, visitIds },
    FUNCTION_NAME,
  )) as { visitId: string; sessionId: string; startAt: string; endAt: string }[];

  if (!visits.length) {
    return [];
  }

  const { startAt, endAt } = visits[0];
  const sessionIds = [...new Set(visits.map(({ sessionId }) => sessionId))];

  const [links, events] = await Promise.all([
    rawQuery(
      `
      select distinct session_id as sessionId, distinct_id as distinctId
      from session_link
      where website_id = {websiteId:UUID}
        and session_id in {sessionIds:Array(UUID)}
      `,
      { websiteId, sessionIds },
      FUNCTION_NAME,
    ) as Promise<{ sessionId: string; distinctId: string }[]>,
    rawQuery(
      `
      select distinct visit_id as visitId, distinct_id as distinctId
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startAt:DateTime64} and {endAt:DateTime64}
        and visit_id in {visitIds:Array(UUID)}
        and distinct_id != ''
      `,
      { websiteId, visitIds, startAt, endAt },
      FUNCTION_NAME,
    ) as Promise<{ visitId: string; distinctId: string }[]>,
  ]);

  return [
    ...visits.flatMap(({ visitId, sessionId }) =>
      links
        .filter(link => link.sessionId === sessionId)
        .map(({ distinctId }) => ({ visitId, distinctId, linked: 1 })),
    ),
    ...events.map(({ visitId, distinctId }) => ({ visitId, distinctId, linked: 0 })),
  ];
}
