import { HEATMAP_EVENT_TYPE } from '@/lib/constants';

const RRWEB_TYPE_INCREMENTAL = 3;
const RRWEB_TYPE_META = 4;
const RRWEB_TYPE_CUSTOM = 5;
const RRWEB_SOURCE_MOUSE_INTERACTION = 2;
const RRWEB_SOURCE_VIEWPORT_RESIZE = 4;
const RRWEB_MOUSE_CLICK = 2;

export interface ExtractedHeatmapEvent {
  eventType: number;
  x: number | null;
  y: number | null;
  viewportW: number | null;
  viewportH: number | null;
  pageH: number | null;
  scrollPct: number | null;
  urlPath: string;
  createdAt: Date;
}

interface ExtractHeatmapEventOptions {
  chunkIndex?: number;
}

function safePathname(href: unknown): string | null {
  if (typeof href !== 'string') return null;
  try {
    return new URL(href).pathname || '/';
  } catch {
    return href.startsWith('/') ? href.split(/[?#]/)[0] : null;
  }
}

export function extractHeatmapEvents(events: any[], _options: ExtractHeatmapEventOptions = {}) {
  if (!Array.isArray(events) || events.length === 0) return [];

  let urlPath: string | null = null;
  let viewportW: number | null = null;
  let viewportH: number | null = null;
  const out: ExtractedHeatmapEvent[] = [];

  for (const ev of events) {
    if (!ev || typeof ev !== 'object') continue;
    const replayTimeMs =
      typeof ev.timestamp === 'number' && Number.isFinite(ev.timestamp) ? ev.timestamp : null;

    if (ev.type === RRWEB_TYPE_META && ev.data) {
      const path = safePathname(ev.data.href);
      if (path) urlPath = path;
      if (typeof ev.data.width === 'number') viewportW = ev.data.width;
      if (typeof ev.data.height === 'number') viewportH = ev.data.height;
      continue;
    }

    if (ev.type === RRWEB_TYPE_CUSTOM && ev.data) {
      if (ev.data.tag === 'url-change') {
        const path = safePathname(ev.data.payload?.url);
        if (path) urlPath = path;
        continue;
      }

      if (ev.data.tag === 'scroll-progress' && ev.data.payload) {
        const p = ev.data.payload;
        const path = safePathname(p.url) ?? urlPath;
        if (path === null) continue;
        out.push({
          eventType: HEATMAP_EVENT_TYPE.scroll,
          x: null,
          y: null,
          viewportW: typeof p.viewportW === 'number' ? p.viewportW : viewportW,
          viewportH: typeof p.viewportH === 'number' ? p.viewportH : viewportH,
          pageH: typeof p.pageH === 'number' ? p.pageH : null,
          scrollPct:
            typeof p.scrollPct === 'number'
              ? Math.max(0, Math.min(100, Math.round(p.scrollPct)))
              : null,
          urlPath: path,
          createdAt: new Date(replayTimeMs ?? Date.now()),
        });
      }
      continue;
    }

    if (ev.type !== RRWEB_TYPE_INCREMENTAL || !ev.data) continue;

    const d = ev.data;

    if (d.source === RRWEB_SOURCE_VIEWPORT_RESIZE) {
      if (typeof d.width === 'number') viewportW = d.width;
      if (typeof d.height === 'number') viewportH = d.height;
      continue;
    }

    if (
      d.source === RRWEB_SOURCE_MOUSE_INTERACTION &&
      d.type === RRWEB_MOUSE_CLICK &&
      urlPath !== null
    ) {
      out.push({
        eventType: HEATMAP_EVENT_TYPE.click,
        x: typeof d.x === 'number' ? Math.round(d.x) : null,
        y: typeof d.y === 'number' ? Math.round(d.y) : null,
        viewportW,
        viewportH,
        pageH: null,
        scrollPct: null,
        urlPath,
        createdAt: new Date(replayTimeMs ?? Date.now()),
      });
    }
  }

  return out;
}
