import clickhouse from '@/lib/clickhouse';
import { HEATMAP_EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getHeatmap';

const POINT_LIMIT = 5000;
const PAGE_LIMIT = 100;

export interface HeatmapParameters {
  startDate: Date;
  endDate: Date;
  urlPath?: string;
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

export interface HeatmapResult {
  pages: HeatmapPage[];
  points: HeatmapPoint[];
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

async function relationalQuery(
  websiteId: string,
  { startDate, endDate, urlPath }: HeatmapParameters,
): Promise<HeatmapResult> {
  const { rawQuery } = prisma;

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
    {
      websiteId,
      eventType: HEATMAP_EVENT_TYPE.click,
      startDate,
      endDate,
    },
    FUNCTION_NAME,
  );

  if (!urlPath) {
    return { pages, points: [] };
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
    {
      websiteId,
      eventType: HEATMAP_EVENT_TYPE.click,
      urlPath,
      startDate,
      endDate,
    },
    FUNCTION_NAME,
  );

  return { pages, points: rawPoints };
}

async function clickhouseQuery(
  websiteId: string,
  { startDate, endDate, urlPath }: HeatmapParameters,
): Promise<HeatmapResult> {
  const { rawQuery } = clickhouse;

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
    {
      websiteId,
      eventType: HEATMAP_EVENT_TYPE.click,
      startDate,
      endDate,
    },
    FUNCTION_NAME,
  );

  const pages: HeatmapPage[] = pageRows.map(p => ({
    urlPath: p.urlPath,
    count: Number(p.count),
    sessions: Number(p.sessions),
  }));

  if (!urlPath) {
    return { pages, points: [] };
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
    {
      websiteId,
      eventType: HEATMAP_EVENT_TYPE.click,
      urlPath,
      startDate,
      endDate,
    },
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

  return { pages, points };
}
