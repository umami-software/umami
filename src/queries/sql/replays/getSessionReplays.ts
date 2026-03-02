import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionReplays';

export async function getSessionReplays(...args: [websiteId: string, filters: QueryFilters]) {
  return relationalQuery(...args);
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = prisma;
  const { search, startDate, endDate } = filters;
  const { queryParams } = parseFilters({
    ...filters,
    websiteId,
    search: search ? `%${search}%` : undefined,
  });

  let dateQuery = '';
  if (startDate && endDate) {
    dateQuery = `and sr.created_at between {{startDate}} and {{endDate}}`;
  } else if (startDate) {
    dateQuery = `and sr.created_at >= {{startDate}}`;
  }

  const searchQuery = search
    ? `and (session.distinct_id ilike {{search}}
           or session.city ilike {{search}}
           or session.browser ilike {{search}})`
    : '';

  return pagedRawQuery(
    `
    select
      sr.session_id as "id",
      sr.website_id as "websiteId",
      session.browser,
      session.os,
      session.device,
      session.country,
      session.city,
      sum(sr.event_count) as "eventCount",
      count(sr.replay_id) as "chunkCount",
      min(sr.started_at) as "startedAt",
      max(sr.ended_at) as "endedAt",
      (extract(epoch from max(sr.ended_at) - min(sr.started_at)) * 1000)::bigint as "duration",
      max(sr.created_at) as "createdAt"
    from session_replay sr
    left join session on session.session_id = sr.session_id
      and session.website_id = sr.website_id
    where sr.website_id = {{websiteId::uuid}}
    ${dateQuery}
    ${searchQuery}
    group by sr.session_id,
      sr.website_id,
      session.browser,
      session.os,
      session.device,
      session.country,
      session.city
    order by max(sr.created_at) desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
  );
}
