import clickhouse from '@/lib/clickhouse';
import { HEATMAP_EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getHeatmap';

const POINT_LIMIT = 5000;
const PAGE_LIMIT = 100;
const SCROLL_BUCKET_SIZE = 5;

export type HeatmapMode = 'click' | 'scroll';

export interface HeatmapParameters {
  startDate: Date;
  endDate: Date;
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

export interface HeatmapResult {
  mode: HeatmapMode;
  pages: HeatmapPage[];
  points: HeatmapPoint[];
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

const emptyScroll = (): HeatmapResult['scroll'] => ({
  buckets: [],
  totalSessions: 0,
  pageH: null,
  viewportW: null,
  viewportH: null,
});

async function relationalQuery(
  websiteId: string,
  { startDate, endDate, urlPath, mode = 'click' }: HeatmapParameters,
): Promise<HeatmapResult> {
  const { rawQuery } = prisma;
  const eventType = mode === 'scroll' ? HEATMAP_EVENT_TYPE.scroll : HEATMAP_EVENT_TYPE.click;

  const pages: HeatmapPage[] = await rawQuery(
    `
    select
      url_path as "urlPath",
      count(*)::int as count,
      count(distinct visit_id)::int as sessions
    from heatmap_event
    where website_id = {{websiteId::uuid}}
      and event_type = {{eventType}}
      and created_at between {{startDate}} and {{endDate}}
    group by url_path
    order by count desc
    limit ${PAGE_LIMIT}
    `,
    { websiteId, eventType, startDate, endDate },
    FUNCTION_NAME,
  );

  if (!urlPath) {
    return { mode, pages, points: [], scroll: emptyScroll() };
  }

  if (mode === 'scroll') {
    const bucketRows: { depth: number | string; sessions: number | string }[] = await rawQuery(
      `
      select
        (floor(max_pct / ${SCROLL_BUCKET_SIZE}) * ${SCROLL_BUCKET_SIZE})::int as depth,
        count(*)::int as sessions
      from (
        select visit_id, max(scroll_pct) as max_pct
        from heatmap_event
        where website_id = {{websiteId::uuid}}
          and event_type = {{eventType}}
          and url_path = {{urlPath}}
          and created_at between {{startDate}} and {{endDate}}
          and scroll_pct is not null
        group by visit_id
      ) per_session
      group by depth
      order by depth
      `,
      { websiteId, eventType, urlPath, startDate, endDate },
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
        count(distinct visit_id)::int as "totalSessions",
        (mode() within group (order by page_h))::int as "pageH",
        (mode() within group (order by viewport_w))::int as "viewportW",
        (mode() within group (order by viewport_h))::int as "viewportH"
      from heatmap_event
      where website_id = {{websiteId::uuid}}
        and event_type = {{eventType}}
        and url_path = {{urlPath}}
        and created_at between {{startDate}} and {{endDate}}
        and scroll_pct is not null
      `,
      { websiteId, eventType, urlPath, startDate, endDate },
      FUNCTION_NAME,
    );

    const dim = dimRows[0];
    return {
      mode,
      pages,
      points: [],
      scroll: {
        buckets: bucketRows.map(r => ({ depth: Number(r.depth), sessions: Number(r.sessions) })),
        totalSessions: Number(dim?.totalSessions ?? 0),
        pageH: dim?.pageH ?? null,
        viewportW: dim?.viewportW ?? null,
        viewportH: dim?.viewportH ?? null,
      },
    };
  }

  const rawPoints: HeatmapPoint[] = await rawQuery(
    `
    select
      node_id as "nodeId",
      x,
      y,
      viewport_w as "viewportW",
      viewport_h as "viewportH",
      count(*)::int as count
    from heatmap_event
    where website_id = {{websiteId::uuid}}
      and event_type = {{eventType}}
      and url_path = {{urlPath}}
      and created_at between {{startDate}} and {{endDate}}
      and x is not null
      and y is not null
      and viewport_w is not null
      and viewport_h is not null
    group by node_id, x, y, viewport_w, viewport_h
    order by count desc
    limit ${POINT_LIMIT}
    `,
    { websiteId, eventType, urlPath, startDate, endDate },
    FUNCTION_NAME,
  );

  return { mode, pages, points: rawPoints, scroll: emptyScroll() };
}

async function clickhouseQuery(
  websiteId: string,
  { startDate, endDate, urlPath, mode = 'click' }: HeatmapParameters,
): Promise<HeatmapResult> {
  const { rawQuery } = clickhouse;
  const eventType = mode === 'scroll' ? HEATMAP_EVENT_TYPE.scroll : HEATMAP_EVENT_TYPE.click;

  const pageRows = await rawQuery<
    { urlPath: string; count: string | number; sessions: string | number }[]
  >(
    `
    select
      url_path as urlPath,
      count() as count,
      uniq(visit_id) as sessions
    from heatmap_event
    where website_id = {websiteId:UUID}
      and event_type = {eventType:UInt8}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by url_path
    order by count desc
    limit ${PAGE_LIMIT}
    `,
    { websiteId, eventType, startDate, endDate },
    FUNCTION_NAME,
  );

  const pages: HeatmapPage[] = pageRows.map(p => ({
    urlPath: p.urlPath,
    count: Number(p.count),
    sessions: Number(p.sessions),
  }));

  if (!urlPath) {
    return { mode, pages, points: [], scroll: emptyScroll() };
  }

  if (mode === 'scroll') {
    const bucketRows = await rawQuery<{ depth: number | string; sessions: number | string }[]>(
      `
      select
        intDiv(max_pct, ${SCROLL_BUCKET_SIZE}) * ${SCROLL_BUCKET_SIZE} as depth,
        count() as sessions
      from (
        select visit_id, max(scroll_pct) as max_pct
        from heatmap_event
        where website_id = {websiteId:UUID}
          and event_type = {eventType:UInt8}
          and url_path = {urlPath:String}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and scroll_pct is not null
        group by visit_id
      )
      group by depth
      order by depth
      `,
      { websiteId, eventType, urlPath, startDate, endDate },
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
        uniq(visit_id) as totalSessions,
        toInt32OrNull(toString(arrayElement(topK(1)(page_h), 1))) as pageH,
        toInt32OrNull(toString(arrayElement(topK(1)(viewport_w), 1))) as viewportW,
        toInt32OrNull(toString(arrayElement(topK(1)(viewport_h), 1))) as viewportH
      from heatmap_event
      where website_id = {websiteId:UUID}
        and event_type = {eventType:UInt8}
        and url_path = {urlPath:String}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and scroll_pct is not null
      `,
      { websiteId, eventType, urlPath, startDate, endDate },
      FUNCTION_NAME,
    );

    const dim = dimRows[0];
    return {
      mode,
      pages,
      points: [],
      scroll: {
        buckets: bucketRows.map(r => ({ depth: Number(r.depth), sessions: Number(r.sessions) })),
        totalSessions: Number(dim?.totalSessions ?? 0),
        pageH: dim?.pageH === null || dim?.pageH === undefined ? null : Number(dim.pageH),
        viewportW:
          dim?.viewportW === null || dim?.viewportW === undefined ? null : Number(dim.viewportW),
        viewportH:
          dim?.viewportH === null || dim?.viewportH === undefined ? null : Number(dim.viewportH),
      },
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
      node_id as nodeId,
      x,
      y,
      viewport_w as viewportW,
      viewport_h as viewportH,
      count() as count
    from heatmap_event
    where website_id = {websiteId:UUID}
      and event_type = {eventType:UInt8}
      and url_path = {urlPath:String}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and x is not null
      and y is not null
      and viewport_w is not null
      and viewport_h is not null
    group by node_id, x, y, viewport_w, viewport_h
    order by count desc
    limit ${POINT_LIMIT}
    `,
    { websiteId, eventType, urlPath, startDate, endDate },
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

  return { mode, pages, points, scroll: emptyScroll() };
}
