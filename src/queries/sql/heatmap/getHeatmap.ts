import clickhouse from '@/lib/clickhouse';
import { HEATMAP_EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getHeatmap';

const POINT_LIMIT = 5000;
const PAGE_LIMIT = 100;
const SCROLL_BUCKET_SIZE = 5;

export type HeatmapMode = 'click' | 'scroll';

export interface HeatmapParameters extends QueryFilters {
  urlPath?: string;
  mode?: HeatmapMode;
}

export interface HeatmapPage {
  urlPath: string;
  count: number;
  sessions: number;
}

export interface HeatmapPoint {
  nodeId: number | null;
  x: number;
  y: number;
  viewportW: number;
  viewportH: number;
  count: number;
}

export interface HeatmapScrollBucket {
  depth: number;
  sessions: number;
}

export interface HeatmapSnapshot {
  replayId: string;
  timestamp: number;
  chunkIndex: number | null;
  eventIndex: number | null;
}

export interface HeatmapResult {
  mode: HeatmapMode;
  pages: HeatmapPage[];
  points: HeatmapPoint[];
  snapshot: HeatmapSnapshot | null;
  scroll: {
    buckets: HeatmapScrollBucket[];
    totalSessions: number;
    pageH: number | null;
    viewportW: number | null;
    viewportH: number | null;
  };
}

export async function getHeatmap(
  websiteId: string,
  parameters: HeatmapParameters,
): Promise<HeatmapResult> {
  return runQuery({
    [PRISMA]: () => relationalQuery(websiteId, parameters),
    [CLICKHOUSE]: () => clickhouseQuery(websiteId, parameters),
  });
}

interface SnapshotRow {
  replayId: string;
  timestamp: number | string;
  chunkIndex: number | string | null;
  eventIndex: number | string | null;
}

interface HeatmapFilterContext {
  joinQuery: string;
  queryParams: Record<string, any>;
}

async function relationalQuery(
  websiteId: string,
  parameters: HeatmapParameters,
): Promise<HeatmapResult> {
  const { rawQuery } = prisma;
  const { startDate, endDate, urlPath, mode = 'click' } = parameters;
  const eventType = mode === 'scroll' ? HEATMAP_EVENT_TYPE.scroll : HEATMAP_EVENT_TYPE.click;
  const filterContext = getRelationalHeatmapFilterContext(websiteId, parameters);
  const clickPageFilter =
    mode === 'click'
      ? `
      and x is not null
      and y is not null
      and viewport_w is not null
      and viewport_h is not null
    `
      : '';

  const pages: HeatmapPage[] = await rawQuery(
    `
    select
      h.url_path as "urlPath",
      count(*)::int as count,
      count(distinct h.visit_id)::int as sessions
    from heatmap_event h
    ${filterContext.joinQuery}
    where h.website_id = {{websiteId::uuid}}
      and h.event_type = {{eventType}}
      and h.created_at between {{startDate}} and {{endDate}}
      ${clickPageFilter}
    group by h.url_path
    order by sessions desc, count desc
    limit ${PAGE_LIMIT}
    `,
    { ...filterContext.queryParams, websiteId, eventType, startDate, endDate },
    FUNCTION_NAME,
  );

  if (!urlPath) {
    return { mode, pages, points: [], snapshot: null, scroll: emptyScroll() };
  }

  if (mode === 'scroll') {
    const bucketRows: { depth: number | string; sessions: number | string }[] = await rawQuery(
      `
      select
        (floor(max_pct / ${SCROLL_BUCKET_SIZE}) * ${SCROLL_BUCKET_SIZE})::int as depth,
        count(*)::int as sessions
      from (
        select h.visit_id, max(h.scroll_pct) as max_pct
        from heatmap_event h
        ${filterContext.joinQuery}
        where h.website_id = {{websiteId::uuid}}
          and h.event_type = {{eventType}}
          and h.url_path = {{urlPath}}
          and h.created_at between {{startDate}} and {{endDate}}
          and h.scroll_pct is not null
        group by h.visit_id
      ) per_session
      group by depth
      order by depth
      `,
      { ...filterContext.queryParams, websiteId, eventType, urlPath, startDate, endDate },
      FUNCTION_NAME,
    );

    const dimRows: {
      totalSessions: number | string;
      pageH: number | null;
      viewportW: number | null;
      viewportH: number | null;
    }[] = await rawQuery(
      `
      select
        count(distinct h.visit_id)::int as "totalSessions",
        (mode() within group (order by h.page_h))::int as "pageH",
        (mode() within group (order by h.viewport_w))::int as "viewportW",
        (mode() within group (order by h.viewport_h))::int as "viewportH"
      from heatmap_event h
      ${filterContext.joinQuery}
      where h.website_id = {{websiteId::uuid}}
        and h.event_type = {{eventType}}
        and h.url_path = {{urlPath}}
        and h.created_at between {{startDate}} and {{endDate}}
        and h.scroll_pct is not null
      `,
      { ...filterContext.queryParams, websiteId, eventType, urlPath, startDate, endDate },
      FUNCTION_NAME,
    );

    const dim = dimRows[0];
    const scroll = {
      buckets: bucketRows.map(r => ({ depth: Number(r.depth), sessions: Number(r.sessions) })),
      totalSessions: Number(dim?.totalSessions ?? 0),
      pageH: dim?.pageH ?? null,
      viewportW: dim?.viewportW ?? null,
      viewportH: dim?.viewportH ?? null,
    };
    const snapshot = await getRelationalSnapshot(rawQuery, {
      websiteId,
      eventType,
      urlPath,
      startDate,
      endDate,
      viewportW: scroll.viewportW,
      viewportH: scroll.viewportH,
      filterContext,
    });

    return {
      mode,
      pages,
      points: [],
      snapshot,
      scroll,
    };
  }

  const rawPoints: HeatmapPoint[] = await rawQuery(
    `
    select
      h.node_id as "nodeId",
      h.x,
      h.y,
      h.viewport_w as "viewportW",
      h.viewport_h as "viewportH",
      count(*)::int as count
    from heatmap_event h
    ${filterContext.joinQuery}
    where h.website_id = {{websiteId::uuid}}
      and h.event_type = {{eventType}}
      and h.url_path = {{urlPath}}
      and h.created_at between {{startDate}} and {{endDate}}
      and h.x is not null
      and h.y is not null
      and h.viewport_w is not null
      and h.viewport_h is not null
    group by h.node_id, h.x, h.y, h.viewport_w, h.viewport_h
    order by count desc
    limit ${POINT_LIMIT}
    `,
    { ...filterContext.queryParams, websiteId, eventType, urlPath, startDate, endDate },
    FUNCTION_NAME,
  );

  const viewport = pickSnapshotViewport(rawPoints);
  const snapshot = await getRelationalSnapshot(rawQuery, {
    websiteId,
    eventType,
    urlPath,
    startDate,
    endDate,
    viewportW: viewport?.width ?? null,
    viewportH: viewport?.height ?? null,
    filterContext,
  });

  return { mode, pages, points: rawPoints, snapshot, scroll: emptyScroll() };
}

async function getRelationalSnapshot(
  rawQuery: typeof prisma.rawQuery,
  {
    websiteId,
    eventType,
    urlPath,
    startDate,
    endDate,
    viewportW,
    viewportH,
    filterContext,
  }: {
    websiteId: string;
    eventType: number;
    urlPath: string;
    startDate: Date;
    endDate: Date;
    viewportW: number | null;
    viewportH: number | null;
    filterContext: HeatmapFilterContext;
  },
): Promise<HeatmapSnapshot | null> {
  const viewportFilter =
    viewportW && viewportH
      ? `
      and h.viewport_w = {{viewportW}}
      and h.viewport_h = {{viewportH}}
    `
      : '';

  const rows: SnapshotRow[] = await rawQuery(
    `
    with best_visit as (
      select
        h.visit_id as visit_id,
        count(*) as event_count,
        min(h.created_at) as first_seen
      from heatmap_event h
      ${filterContext.joinQuery}
      where h.website_id = {{websiteId::uuid}}
        and h.event_type = {{eventType}}
        and h.url_path = {{urlPath}}
        and h.created_at between {{startDate}} and {{endDate}}
        ${viewportFilter}
      group by h.visit_id
      order by event_count desc, first_seen asc
      limit 1
    )
    select
      h.visit_id as "replayId",
      coalesce(h.replay_time_ms, (extract(epoch from h.created_at) * 1000)::bigint) as "timestamp",
      h.replay_chunk_index as "chunkIndex",
      h.replay_event_index as "eventIndex"
    from heatmap_event h
    inner join best_visit bv on bv.visit_id = h.visit_id
    inner join (
      select distinct visit_id
      from session_replay
      where website_id = {{websiteId::uuid}}
    ) sr on sr.visit_id = h.visit_id
    ${filterContext.joinQuery}
    where h.website_id = {{websiteId::uuid}}
      and h.event_type = {{eventType}}
      and h.url_path = {{urlPath}}
      and h.created_at between {{startDate}} and {{endDate}}
      ${viewportFilter}
    order by
      case when h.replay_chunk_index is null then 1 else 0 end asc,
      h.replay_chunk_index asc nulls last,
      h.replay_event_index asc nulls last,
      h.created_at asc
    limit 1
    `,
    { ...filterContext.queryParams, websiteId, eventType, urlPath, startDate, endDate, viewportW, viewportH },
    FUNCTION_NAME,
  );

  return mapSnapshot(rows[0]);
}

async function clickhouseQuery(
  websiteId: string,
  parameters: HeatmapParameters,
): Promise<HeatmapResult> {
  const { rawQuery } = clickhouse;
  const { startDate, endDate, urlPath, mode = 'click' } = parameters;
  const eventType = mode === 'scroll' ? HEATMAP_EVENT_TYPE.scroll : HEATMAP_EVENT_TYPE.click;
  const filterContext = getClickhouseHeatmapFilterContext(websiteId, parameters);
  const clickPageFilter =
    mode === 'click'
      ? `
      and x is not null
      and y is not null
      and viewport_w is not null
      and viewport_h is not null
    `
      : '';

  const pageRows = await rawQuery<
    { urlPath: string; count: string | number; sessions: string | number }[]
  >(
    `
    select
      h.url_path as urlPath,
      count() as count,
      uniq(h.visit_id) as sessions
    from heatmap_event h
    ${filterContext.joinQuery}
    where h.website_id = {websiteId:UUID}
      and h.event_type = {eventType:UInt8}
      and h.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${clickPageFilter}
    group by h.url_path
    order by sessions desc, count desc
    limit ${PAGE_LIMIT}
    `,
    { ...filterContext.queryParams, websiteId, eventType, startDate, endDate },
    FUNCTION_NAME,
  );

  const pages: HeatmapPage[] = pageRows.map(p => ({
    urlPath: p.urlPath,
    count: Number(p.count),
    sessions: Number(p.sessions),
  }));

  if (!urlPath) {
    return { mode, pages, points: [], snapshot: null, scroll: emptyScroll() };
  }

  if (mode === 'scroll') {
    const bucketRows = await rawQuery<{ depth: number | string; sessions: number | string }[]>(
      `
      select
        intDiv(max_pct, ${SCROLL_BUCKET_SIZE}) * ${SCROLL_BUCKET_SIZE} as depth,
        count() as sessions
      from (
        select h.visit_id, max(h.scroll_pct) as max_pct
        from heatmap_event h
        ${filterContext.joinQuery}
        where h.website_id = {websiteId:UUID}
          and h.event_type = {eventType:UInt8}
          and h.url_path = {urlPath:String}
          and h.created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and h.scroll_pct is not null
        group by h.visit_id
      )
      group by depth
      order by depth
      `,
      { ...filterContext.queryParams, websiteId, eventType, urlPath, startDate, endDate },
      FUNCTION_NAME,
    );

    const dimRows = await rawQuery<
      {
        totalSessions: number | string;
        pageH: number | null;
        viewportW: number | null;
        viewportH: number | null;
      }[]
    >(
      `
      select
        uniq(h.visit_id) as totalSessions,
        toInt32OrNull(toString(arrayElement(topK(1)(h.page_h), 1))) as pageH,
        toInt32OrNull(toString(arrayElement(topK(1)(h.viewport_w), 1))) as viewportW,
        toInt32OrNull(toString(arrayElement(topK(1)(h.viewport_h), 1))) as viewportH
      from heatmap_event h
      ${filterContext.joinQuery}
      where h.website_id = {websiteId:UUID}
        and h.event_type = {eventType:UInt8}
        and h.url_path = {urlPath:String}
        and h.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and h.scroll_pct is not null
      `,
      { ...filterContext.queryParams, websiteId, eventType, urlPath, startDate, endDate },
      FUNCTION_NAME,
    );

    const dim = dimRows[0];
    const scroll = {
      buckets: bucketRows.map(r => ({ depth: Number(r.depth), sessions: Number(r.sessions) })),
      totalSessions: Number(dim?.totalSessions ?? 0),
      pageH: dim?.pageH === null || dim?.pageH === undefined ? null : Number(dim.pageH),
      viewportW:
        dim?.viewportW === null || dim?.viewportW === undefined ? null : Number(dim.viewportW),
      viewportH:
        dim?.viewportH === null || dim?.viewportH === undefined ? null : Number(dim.viewportH),
    };
    const snapshot = await getClickhouseSnapshot(rawQuery, {
      websiteId,
      eventType,
      urlPath,
      startDate,
      endDate,
      viewportW: scroll.viewportW,
      viewportH: scroll.viewportH,
      filterContext,
    });

    return {
      mode,
      pages,
      points: [],
      snapshot,
      scroll,
    };
  }

  const pointRows = await rawQuery<
    {
      nodeId: number | null;
      x: number;
      y: number;
      viewportW: number;
      viewportH: number;
      count: string | number;
    }[]
  >(
    `
    select
      h.node_id as nodeId,
      h.x,
      h.y,
      h.viewport_w as viewportW,
      h.viewport_h as viewportH,
      count() as count
    from heatmap_event h
    ${filterContext.joinQuery}
    where h.website_id = {websiteId:UUID}
      and h.event_type = {eventType:UInt8}
      and h.url_path = {urlPath:String}
      and h.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and h.x is not null
      and h.y is not null
      and h.viewport_w is not null
      and h.viewport_h is not null
    group by h.node_id, h.x, h.y, h.viewport_w, h.viewport_h
    order by count desc
    limit ${POINT_LIMIT}
    `,
    { ...filterContext.queryParams, websiteId, eventType, urlPath, startDate, endDate },
    FUNCTION_NAME,
  );

  const points: HeatmapPoint[] = pointRows.map(p => ({
    nodeId: p.nodeId === null || p.nodeId === undefined ? null : Number(p.nodeId),
    x: Number(p.x),
    y: Number(p.y),
    viewportW: Number(p.viewportW),
    viewportH: Number(p.viewportH),
    count: Number(p.count),
  }));

  const viewport = pickSnapshotViewport(points);
  const snapshot = await getClickhouseSnapshot(rawQuery, {
    websiteId,
    eventType,
    urlPath,
    startDate,
    endDate,
    viewportW: viewport?.width ?? null,
    viewportH: viewport?.height ?? null,
    filterContext,
  });

  return { mode, pages, points, snapshot, scroll: emptyScroll() };
}

async function getClickhouseSnapshot(
  rawQuery: typeof clickhouse.rawQuery,
  {
    websiteId,
    eventType,
    urlPath,
    startDate,
    endDate,
    viewportW,
    viewportH,
    filterContext,
  }: {
    websiteId: string;
    eventType: number;
    urlPath: string;
    startDate: Date;
    endDate: Date;
    viewportW: number | null;
    viewportH: number | null;
    filterContext: HeatmapFilterContext;
  },
): Promise<HeatmapSnapshot | null> {
  const viewportFilter =
    viewportW && viewportH
      ? `
      and h.viewport_w = {viewportW:UInt32}
      and h.viewport_h = {viewportH:UInt32}
    `
      : '';

  const rows = await rawQuery<SnapshotRow[]>(
    `
    with best_visit as (
      select
        h.visit_id as visit_id,
        count() as event_count,
        min(h.created_at) as first_seen
      from heatmap_event h
      ${filterContext.joinQuery}
      where h.website_id = {websiteId:UUID}
        and h.event_type = {eventType:UInt8}
        and h.url_path = {urlPath:String}
        and h.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${viewportFilter}
      group by h.visit_id
      order by event_count desc, first_seen asc
      limit 1
    )
    select
      toString(h.visit_id) as replayId,
      ifNull(h.replay_time_ms, toInt64(toUnixTimestamp(h.created_at)) * 1000) as timestamp,
      h.replay_chunk_index as chunkIndex,
      h.replay_event_index as eventIndex
    from heatmap_event h
    inner join best_visit bv on bv.visit_id = h.visit_id
    inner join (
      select distinct visit_id
      from session_replay
      where website_id = {websiteId:UUID}
    ) sr on sr.visit_id = h.visit_id
    ${filterContext.joinQuery}
    where h.website_id = {websiteId:UUID}
      and h.event_type = {eventType:UInt8}
      and h.url_path = {urlPath:String}
      and h.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${viewportFilter}
    order by
      isNull(h.replay_chunk_index) asc,
      h.replay_chunk_index asc,
      h.replay_event_index asc,
      h.created_at asc
    limit 1
    `,
    {
      ...filterContext.queryParams,
      websiteId,
      eventType,
      urlPath,
      startDate,
      endDate,
      viewportW,
      viewportH,
    },
    FUNCTION_NAME,
  );

  return mapSnapshot(rows[0]);
}

function emptyScroll(): HeatmapResult['scroll'] {
  return {
    buckets: [],
    totalSessions: 0,
    pageH: null,
    viewportW: null,
    viewportH: null,
  };
}

function pickSnapshotViewport(points: HeatmapPoint[]): { width: number; height: number } | null {
  const buckets = new Map<string, { width: number; height: number; count: number }>();

  for (const p of points) {
    const key = `${p.viewportW}x${p.viewportH}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += p.count;
    } else {
      buckets.set(key, { width: p.viewportW, height: p.viewportH, count: p.count });
    }
  }

  let best: { width: number; height: number; count: number } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.count > best.count) {
      best = bucket;
    }
  }

  return best ? { width: best.width, height: best.height } : null;
}

function mapSnapshot(row?: SnapshotRow | null): HeatmapSnapshot | null {
  if (!row) {
    return null;
  }

  return {
    replayId: row.replayId,
    timestamp: Number(row.timestamp),
    chunkIndex:
      row.chunkIndex === null || row.chunkIndex === undefined ? null : Number(row.chunkIndex),
    eventIndex:
      row.eventIndex === null || row.eventIndex === undefined ? null : Number(row.eventIndex),
  };
}

function getRelationalHeatmapFilterContext(
  websiteId: string,
  filters: QueryFilters,
): HeatmapFilterContext {
  const { parseFilters } = prisma;
  const { filterQuery, cohortQuery, excludeBounceQuery, joinSessionQuery, queryParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  if (!(filterQuery || cohortQuery || excludeBounceQuery)) {
    return { joinQuery: '', queryParams };
  }

  return {
    joinQuery: `
    inner join (
      select distinct website_event.website_id, website_event.session_id, website_event.visit_id
      from website_event
      ${joinSessionQuery}
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
    ) filtered_visits
      on filtered_visits.website_id = h.website_id
      and filtered_visits.session_id = h.session_id
      and filtered_visits.visit_id = h.visit_id
    `,
    queryParams,
  };
}

function getClickhouseHeatmapFilterContext(
  websiteId: string,
  filters: QueryFilters,
): HeatmapFilterContext {
  const { parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  if (!(filterQuery || cohortQuery || excludeBounceQuery)) {
    return { joinQuery: '', queryParams };
  }

  return {
    joinQuery: `
    inner join (
      select distinct website_id, session_id, visit_id
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
    ) filtered_visits
      on filtered_visits.website_id = h.website_id
      and filtered_visits.session_id = h.session_id
      and filtered_visits.visit_id = h.visit_id
    `,
    queryParams,
  };
}
