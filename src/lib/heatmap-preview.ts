import type { HeatmapSnapshot } from '@/queries/sql';

export const SNAPSHOT_VIEWPORT_HASH_KEY = 'umami-viewport';

export interface PreviewViewportMetric {
  viewportW: number;
  viewportH: number;
  pageW: number;
  pageH: number;
  count: number;
}

export interface SnapshotFrame {
  url: string;
  width: number;
  height: number;
  scale: number;
  scaledHeight: number;
}

/**
 * Picks the most common viewport (by weight) among the metrics of one screen width group.
 * Page size is the largest one recorded for that viewport.
 */
export function pickRepresentativeViewport(
  metrics: PreviewViewportMetric[],
): Omit<PreviewViewportMetric, 'count'> | null {
  const viewports = new Map<string, PreviewViewportMetric>();

  for (const metric of metrics) {
    if (!(metric.viewportW > 0) || !(metric.viewportH > 0)) {
      continue;
    }

    const key = `${metric.viewportW}x${metric.viewportH}`;
    const existing = viewports.get(key);

    if (existing) {
      existing.count += metric.count;
      existing.pageW = Math.max(existing.pageW, metric.pageW);
      existing.pageH = Math.max(existing.pageH, metric.pageH);
    } else {
      viewports.set(key, { ...metric });
    }
  }

  let best: PreviewViewportMetric | null = null;

  for (const viewport of viewports.values()) {
    if (!best || viewport.count > best.count) {
      best = viewport;
    }
  }

  if (!best) {
    return null;
  }

  const { viewportW, viewportH, pageW, pageH } = best;

  return { viewportW, viewportH, pageW, pageH };
}

/**
 * Returns the snapshot to preview for a screen width group, using the viewport most
 * recorded in that group. Falls back to the snapshot chosen by the server.
 */
export function getSnapshotForGroup(
  snapshot: HeatmapSnapshot,
  groupMetrics: PreviewViewportMetric[],
): HeatmapSnapshot {
  const viewport = pickRepresentativeViewport(groupMetrics);

  if (!viewport) {
    return snapshot;
  }

  return {
    ...snapshot,
    id: `${snapshot.id}:${viewport.viewportW}x${viewport.viewportH}`,
    ...viewport,
  };
}

export function getSnapshotFrameHeight({
  pageH,
  viewportH,
}: Pick<HeatmapSnapshot, 'pageH' | 'viewportH'>) {
  // Use the recorded viewport height for near-single-screen pages so `100vh` matches the visitor's screen.
  if (pageH <= viewportH * 1.25) {
    return viewportH;
  }

  return pageH;
}

/**
 * The preview page can read the visitor's window size from the URL fragment
 * (`#umami-viewport=<width>x<height>`, CSS pixels) to rebuild viewport based layouts.
 */
export function buildSnapshotUrl(url: string, viewportW: number, viewportH: number) {
  const [base] = url.split('#');

  return `${base}#${SNAPSHOT_VIEWPORT_HASH_KEY}=${Math.round(viewportW)}x${Math.round(viewportH)}`;
}

/**
 * Describes the preview frame: rendered at the visitor's real layout size, then scaled
 * with the same factor used to normalize points to the selected screen width.
 */
export function getSnapshotFrame(snapshot: HeatmapSnapshot, targetWidth: number): SnapshotFrame {
  const viewportW = Math.max(1, snapshot.viewportW);
  // `pageW` excludes the scrollbar, so it is the real layout width when available.
  const width = snapshot.pageW > 0 && snapshot.pageW <= viewportW ? snapshot.pageW : viewportW;
  const height = Math.max(1, getSnapshotFrameHeight(snapshot));
  const scale = targetWidth / viewportW;

  return {
    url: buildSnapshotUrl(snapshot.url, viewportW, snapshot.viewportH),
    width,
    height,
    scale,
    scaledHeight: height * scale,
  };
}
