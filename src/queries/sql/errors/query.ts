import clickhouse from '@/lib/clickhouse';
import type { ErrorQuery } from '@/lib/errors/schema';
import prisma from '@/lib/prisma';

export interface ErrorScope {
  websiteId: string;
  resetAt?: Date | null;
  retentionDays: number;
}

async function queryContext(scope: ErrorScope, filters?: ErrorQuery, issueId?: string) {
  const ch = clickhouse.enabled;
  const params: Record<string, any> = {
    websiteId: scope.websiteId,
    cutoff: new Date(Date.now() - scope.retentionDays * 86400000),
    resetAt: scope.resetAt || new Date(0),
  };
  const param = (name: string, type = 'String') =>
    ch ? `{${name}:${type}}` : `{{${name}${type === 'UUID' ? '::uuid' : ''}}}`;
  const conditions = [
    `website_id = ${param('websiteId', 'UUID')}`,
    `received_at >= ${param('cutoff', 'DateTime64(3)')}`,
    `created_at > ${param('resetAt', 'DateTime64(3)')}`,
  ];
  if (filters) {
    params.startAt = new Date(filters.startAt);
    params.endAt = new Date(filters.endAt);
    conditions.push(
      `created_at between ${param('startAt', 'DateTime64(3)')} and ${param('endAt', 'DateTime64(3)')}`,
    );
    for (const [key, column] of [
      ['release', 'release'],
      ['environment', 'environment'],
      ['browser', 'browser'],
      ['urlPath', 'url_path'],
    ]) {
      if (filters[key]) {
        params[key] = filters[key];
        conditions.push(`${column} = ${param(key)}`);
      }
    }
    if (filters.search) {
      params.search = filters.search.toLowerCase();
      conditions.push(
        ch
          ? `positionCaseInsensitive(concat(name, ': ', message), ${param('search')}) > 0`
          : `position(${param('search')} in lower(name || ': ' || message)) > 0`,
      );
    }
    if (filters.status) {
      const issues = await prisma.client.errorIssue.findMany({
        where: { websiteId: scope.websiteId, status: filters.status },
        select: { id: true },
      });
      params.issueIds = ch ? issues.map(i => i.id) : issues.map(i => i.id).join(',');
      conditions.push(
        ch
          ? `has(${param('issueIds', 'Array(UUID)')}, issue_id)`
          : `issue_id::text = any(string_to_array(${param('issueIds')}, ','))`,
      );
    }
  }
  if (issueId) {
    params.issueId = issueId;
    conditions.push(`issue_id = ${param('issueId', 'UUID')}`);
  }
  const from = `from error_event${ch ? ' final' : ''} where ${conditions.join(' and ')}`;
  const run = async (sql: string, extra: Record<string, any> = {}): Promise<any[]> => {
    const values = { ...params, ...extra };
    if (ch) {
      for (const key of Object.keys(values))
        if (values[key] instanceof Date)
          values[key] = values[key].toISOString().replace('T', ' ').replace('Z', '');
      return clickhouse.rawQuery<any[]>(sql, values);
    }
    return prisma.rawQuery(sql, values);
  };
  return { ch, from, run, param };
}

export async function getErrorIssues(scope: ErrorScope, filters: ErrorQuery) {
  const { from, run, ch } = await queryContext(scope, filters);
  const grouping = `select issue_id as "id", count(*) as "occurrences",
    count(distinct visit_id) as "visits", min(created_at) as "firstSeen", max(created_at) as "lastSeen"
    ${from} group by issue_id`;
  const [rows, totals] = await Promise.all([
    run(
      `${grouping} order by "lastSeen" desc, "id" limit ${filters.pageSize} offset ${(filters.page - 1) * filters.pageSize}`,
    ),
    run(`select count(*) as "count" from (${grouping}) ${ch ? '' : 'issues'}`),
  ]);
  const issues = await prisma.client.errorIssue.findMany({
    where: { websiteId: scope.websiteId, id: { in: rows.map(r => r.id) } },
  });
  const byId = new Map(issues.map(issue => [issue.id, issue]));
  return {
    data: rows
      .filter(row => byId.has(row.id))
      .map(row => ({
        ...byId.get(row.id),
        ...row,
        occurrences: Number(row.occurrences),
        visits: Number(row.visits),
      })),
    count: Number(totals[0]?.count || 0),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getErrorStats(scope: ErrorScope, filters: ErrorQuery, issueId?: string) {
  const { from, run, ch } = await queryContext(scope, filters, issueId);
  const day = ch
    ? "formatDateTime(created_at, '%Y-%m-%d', 'UTC')"
    : "to_char(created_at at time zone 'UTC', 'YYYY-MM-DD')";
  const [totals, series] = await Promise.all([
    run(`select count(*) as "occurrences", count(distinct visit_id) as "visits", count(distinct issue_id) as "issues",
      min(created_at) as "firstSeen", max(created_at) as "lastSeen" ${from}`),
    run(
      `select ${day} as "date", count(*) as "occurrences" ${from} group by ${day} order by ${day}`,
    ),
  ]);
  const total = totals[0];
  return {
    ...total,
    firstSeen: Number(total.occurrences) ? total.firstSeen : null,
    lastSeen: Number(total.occurrences) ? total.lastSeen : null,
    occurrences: Number(total.occurrences),
    visits: Number(total.visits),
    issues: Number(total.issues),
    series: series.map(row => ({ date: row.date, occurrences: Number(row.occurrences) })),
  };
}

export async function getErrorEvents(scope: ErrorScope, issueId: string, filters: ErrorQuery) {
  const { from, run } = await queryContext(scope, filters, issueId);
  const [rows, totals] = await Promise.all([
    run(`select event_id as "id", created_at as "createdAt", name, message, handled, release, environment,
      browser, os, device, url_path as "urlPath", session_id as "sessionId", visit_id as "visitId"
      ${from} order by created_at desc, event_id limit ${filters.pageSize} offset ${(filters.page - 1) * filters.pageSize}`),
    run(`select count(*) as "count" ${from}`),
  ]);
  return {
    data: rows,
    count: Number(totals[0]?.count || 0),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getErrorEvent(scope: ErrorScope, issueId: string, eventId: string) {
  const { from, run, param, ch } = await queryContext(scope, undefined, issueId);
  const rows = await run(
    `select event_id as "id", created_at as "createdAt", name, message, stack, frames, tags,
    handled, release, environment, browser, os, device, url_path as "urlPath",
    session_id as "sessionId", visit_id as "visitId" ${from} and event_id = ${param('eventId', 'UUID')} limit 1`,
    { eventId },
  );
  if (!rows.length) return null;
  const event = rows[0];
  const replays = await run(
    `select visit_id from session_replay
    where website_id = ${param('websiteId', 'UUID')} and session_id = ${param('sessionId', 'UUID')}
    and visit_id = ${param('visitId', 'UUID')}
    and started_at <= ${param('time', 'DateTime64(3)')} and ended_at >= ${param('time', 'DateTime64(3)')} limit 1`,
    { sessionId: event.sessionId, visitId: event.visitId, time: new Date(event.createdAt) },
  );
  return {
    ...event,
    frames: ch ? JSON.parse(event.frames) : event.frames,
    tags: ch ? JSON.parse(event.tags) : event.tags,
    replayId: replays.length ? event.visitId : null,
  };
}
