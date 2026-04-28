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
  nodeId: number | null;
  x: number | null;
  y: number | null;
  viewportW: number | null;
  viewportH: number | null;
  scrollPct: number | null;
  createdAt: Date;
}

export async function saveHeatmapEvents(rows: HeatmapEventRow[]) {
  if (!rows?.length) return;

  return runQuery({
    [PRISMA]: () => relationalQuery(rows),
    [CLICKHOUSE]: () => clickhouseQuery(rows),
  });
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
      nodeId: r.nodeId,
      x: r.x,
      y: r.y,
      viewportW: r.viewportW,
      viewportH: r.viewportH,
      scrollPct: r.scrollPct,
      createdAt: r.createdAt,
    })),
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
    node_id: r.nodeId,
    x: r.x,
    y: r.y,
    viewport_w: r.viewportW,
    viewport_h: r.viewportH,
    scroll_pct: r.scrollPct,
    created_at: getUTCString(r.createdAt),
  }));

  if (kafka.enabled) {
    return sendMessage('heatmap_event', messages);
  }

  return insert('heatmap_event', messages);
}
