import clickhouse from '@/lib/clickhouse';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';

export interface HeatmapEventRow {
  websiteId: string;
  sessionId: string;
  visitId: string;
  urlPath: string;
  eventType: number;
  x: number | null;
  y: number | null;
  pageX: number | null;
  pageY: number | null;
  pageW: number | null;
  viewportW: number | null;
  viewportH: number | null;
  pageH: number | null;
  scrollPct: number | null;
  createdAt: Date;
}

export async function saveHeatmapEvents(rows: HeatmapEventRow[]) {
  if (!rows?.length) return;

  const normalizedRows = rows.map(r => ({
    ...r,
    x: toInt(r.x),
    y: toInt(r.y),
    pageX: toInt(r.pageX),
    pageY: toInt(r.pageY),
    pageW: toInt(r.pageW),
    viewportW: toInt(r.viewportW),
    viewportH: toInt(r.viewportH),
    pageH: toInt(r.pageH),
    scrollPct: toScrollPct(r.scrollPct),
  }));

  return runQuery({
    [PRISMA]: () => relationalQuery(normalizedRows),
    [CLICKHOUSE]: () => clickhouseQuery(normalizedRows),
  });
}

function toInt(value: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : null;
}

function toScrollPct(value: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

async function relationalQuery(rows: HeatmapEventRow[]) {
  return prisma.client.heatmapEvent.createMany({
    data: rows.map(r => ({
      id: uuid(),
      websiteId: r.websiteId,
      sessionId: r.sessionId,
      visitId: r.visitId,
      urlPath: r.urlPath,
      eventType: r.eventType,
      x: r.x,
      y: r.y,
      pageX: r.pageX,
      pageY: r.pageY,
      pageW: r.pageW,
      viewportW: r.viewportW,
      viewportH: r.viewportH,
      pageH: r.pageH,
      scrollPct: r.scrollPct,
      createdAt: r.createdAt,
    })) as any,
  });
}

async function clickhouseQuery(rows: HeatmapEventRow[]) {
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const messages = rows.map(r => ({
    heatmap_event_id: uuid(),
    website_id: r.websiteId,
    session_id: r.sessionId,
    visit_id: r.visitId,
    url_path: r.urlPath,
    event_type: r.eventType,
    x: r.x,
    y: r.y,
    page_x: r.pageX,
    page_y: r.pageY,
    page_w: r.pageW,
    viewport_w: r.viewportW,
    viewport_h: r.viewportH,
    page_h: r.pageH,
    scroll_pct: r.scrollPct,
    created_at: getUTCString(r.createdAt),
  }));

  if (kafka.enabled) {
    return sendMessage('heatmap_event', messages);
  }

  return insert('heatmap_event', messages);
}
