'use client';
import { Column, Grid, Heading, Loading, Row, Switch, Text } from '@umami/react-zen';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useResultQuery } from '@/components/hooks';
import { useReplayQuery } from '@/components/hooks/queries/useReplayQuery';
import { formatLongNumber } from '@/lib/format';
import type { HeatmapMode, HeatmapPoint, HeatmapResult, HeatmapSnapshot } from '@/queries/sql';
import styles from './Heatmap.module.css';
import 'rrweb/dist/replay/rrweb-replay.css';

const MAX_RENDER_WIDTH = 1024;

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width || el.clientWidth || 0);
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

interface ReplayData {
  events: any[];
}

interface ReplayInstance {
  iframe?: HTMLIFrameElement;
  wrapper?: HTMLDivElement;
  on: (event: string, handler: (...args: any[]) => void) => void;
  pause: (timeOffset?: number) => void;
  disableInteract: () => void;
  destroy: () => void;
}

interface ViewportBucket {
  width: number;
  height: number;
  count: number;
}

interface HeatmapProps {
  websiteId: string;
  urlPath: string;
  onUrlPathChange: (urlPath: string) => void;
  mode: HeatmapMode;
  search: string;
}

export function Heatmap({ websiteId, urlPath, onUrlPathChange, mode, search }: HeatmapProps) {
  const {
    data: pagesData,
    error,
    isLoading,
  } = useResultQuery<HeatmapResult>('heatmap', {
    websiteId,
    mode,
  });

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useResultQuery<HeatmapResult>(
    'heatmap',
    {
      websiteId,
      urlPath: urlPath || undefined,
      mode,
    },
    {
      enabled: Boolean(urlPath),
    },
  );

  const pages = pagesData?.pages ?? [];
  const filteredPages = useMemo(() => {
    if (!search) {
      return pages;
    }

    const value = search.toLowerCase();

    return pages.filter(page => page.urlPath.toLowerCase().includes(value));
  }, [pages, search]);
  const points = detailData?.points ?? [];
  const scroll = detailData?.scroll;
  const snapshot = detailData?.snapshot ?? null;
  const detailLoading = Boolean(urlPath) && (isDetailLoading || isDetailFetching);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (filteredPages.length === 0) {
      if (urlPath) {
        onUrlPathChange('');
      }
      return;
    }

    if (!urlPath || filteredPages.some(page => page.urlPath === urlPath)) {
      return;
    }

    onUrlPathChange(filteredPages[0].urlPath);
  }, [filteredPages, isLoading, onUrlPathChange, urlPath]);

  return (
    <LoadingPanel data={pagesData} isLoading={isLoading} error={error} minHeight="900px">
      <Grid columns="320px 12px 1fr" minHeight="900px" className={styles.layoutGrid}>
        <PageList
          pages={filteredPages}
          selected={urlPath}
          onSelect={onUrlPathChange}
          mode={mode}
          hasSearch={Boolean(search)}
        />
        <div className={styles.railDivider} aria-hidden="true" />
        <Column className={styles.contentColumn} gap>
          {urlPath ? (
            mode === 'scroll' ? (
              <ScrollHeatmapView
                websiteId={websiteId}
                urlPath={urlPath}
                scroll={scroll}
                snapshot={snapshot}
                isLoading={detailLoading}
              />
            ) : (
              <HeatmapView
                urlPath={urlPath}
                websiteId={websiteId}
                points={points}
                snapshot={snapshot}
                isLoading={detailLoading}
              />
            )
          ) : (
            <EmptyState />
          )}
        </Column>
      </Grid>
    </LoadingPanel>
  );
}

function PageList({
  pages,
  selected,
  onSelect,
  mode,
  hasSearch,
}: {
  pages: HeatmapResult['pages'];
  selected: string;
  onSelect: (urlPath: string) => void;
  mode: HeatmapMode;
  hasSearch: boolean;
}) {
  const { t, messages } = useMessages();

  return (
    <Column className={styles.pageList} gap="1">
      <Heading size="lg">Pages</Heading>
      <Column className={styles.pageListItems} gap="2">
        {pages.length === 0 && (
          <Text color="muted">{hasSearch ? 'No matching pages' : t(messages.noDataAvailable)}</Text>
        )}
        {pages.map(p => (
          <button
            key={p.urlPath}
            type="button"
            onClick={() => onSelect(p.urlPath)}
            title={p.urlPath}
            className={`${styles.pageButton} ${selected === p.urlPath ? styles.pageButtonSelected : ''}`}
          >
            <Row alignItems="center" justifyContent="space-between" gap="2">
              <Text truncate>{p.urlPath}</Text>
              <Text color="muted">{formatLongNumber(mode === 'scroll' ? p.sessions : p.count)}</Text>
            </Row>
          </button>
        ))}
      </Column>
    </Column>
  );
}

function pickViewport(points: HeatmapPoint[]): ViewportBucket | null {
  if (!points.length) return null;
  const buckets = new Map<string, ViewportBucket>();
  for (const p of points) {
    const key = `${p.viewportW}x${p.viewportH}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += p.count;
    } else {
      buckets.set(key, { width: p.viewportW, height: p.viewportH, count: p.count });
    }
  }
  let best: ViewportBucket | null = null;
  for (const b of buckets.values()) {
    if (!best || b.count > best.count) best = b;
  }
  return best;
}

function HeatmapView({
  urlPath,
  websiteId,
  points,
  snapshot,
  isLoading,
}: {
  urlPath: string;
  websiteId: string;
  points: HeatmapPoint[];
  snapshot: HeatmapSnapshot | null;
  isLoading: boolean;
}) {
  const [showPage, setShowPage] = useState(true);
  const [snapshotReady, setSnapshotReady] = useState(false);

  const viewport = useMemo(() => pickViewport(points), [points]);

  const visible = useMemo(() => {
    if (!viewport) return [];
    return points.filter(p => p.viewportW === viewport.width && p.viewportH === viewport.height);
  }, [points, viewport]);

  const maxCount = useMemo(
    () => visible.reduce((m, p) => (p.count > m ? p.count : m), 1),
    [visible],
  );

  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>();
  const handleSnapshotReady = useCallback(() => setSnapshotReady(true), []);

  useEffect(() => {
    setSnapshotReady(!(showPage && snapshot));
  }, [containerWidth, showPage, snapshot]);

  if (isLoading) {
    return <CanvasLoading />;
  }

  if (!viewport || visible.length === 0) {
    return <EmptyState />;
  }

  const renderWidth = Math.min(containerWidth > 0 ? containerWidth : viewport.width, MAX_RENDER_WIDTH);
  const scale = renderWidth / viewport.width;
  const renderHeight = Math.round(viewport.height * scale);
  const showSnapshot = renderWidth > 0 && showPage && !!snapshot;
  const showOverlay = !showSnapshot || snapshotReady;

  return (
    <Column gap>
      <Column gap="2" className={styles.summaryHeader}>
        <Row alignItems="center" justifyContent="space-between" gap>
          <Text color="muted" title={urlPath} className={styles.summaryPath}>
            {urlPath}
          </Text>
        </Row>
        <Row alignItems="center" justifyContent="space-between" gap className={styles.summaryStats}>
          <Text color="muted" className={styles.summaryStat}>
          {visible.length} positions · {formatLongNumber(visible.reduce((s, p) => s + p.count, 0))}{' '}
          clicks · viewport {viewport.width}×{viewport.height}
          </Text>
        </Row>
      </Column>
      <div ref={containerRef} className={styles.canvasWrapper}>
        <div
          className={styles.canvas}
          style={{ width: renderWidth || '100%', height: renderHeight || 0 }}
        >
          <div className={styles.canvasClip}>
            {showSnapshot && !snapshotReady && <CanvasLoading />}
            {showSnapshot && (
              <ReplaySnapshot
                websiteId={websiteId}
                snapshot={snapshot}
                width={viewport.width}
                height={viewport.height}
                scale={scale}
                onReady={handleSnapshotReady}
              />
            )}
          </div>
          {showOverlay && (
            <div className={`${styles.overlay} ${styles.heatOverlay}`}>
              {visible.map((p, i) => {
                const intensity = Math.min(1, p.count / maxCount);
                const size = 24 + intensity * 36;
                return (
                  <div
                    key={`${p.x}-${p.y}-${i}`}
                    className={styles.dot}
                    style={{
                      left: p.x * scale - size / 2,
                      top: p.y * scale - size / 2,
                      width: size,
                      height: size,
                      opacity: 0.25 + intensity * 0.55,
                    }}
                    title={`${p.count} click${p.count === 1 ? '' : 's'}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      {snapshot && (
        <Row justifyContent="center" className={styles.snapshotControlRow}>
          <Switch isSelected={showPage} onChange={setShowPage}>
            Show page
          </Switch>
        </Row>
      )}
    </Column>
  );
}

function ScrollHeatmapView({
  urlPath,
  websiteId,
  scroll,
  snapshot,
  isLoading,
}: {
  urlPath: string;
  websiteId: string;
  scroll: HeatmapResult['scroll'] | undefined;
  snapshot: HeatmapSnapshot | null;
  isLoading: boolean;
}) {
  const [showPage, setShowPage] = useState(true);
  const [snapshotReady, setSnapshotReady] = useState(false);

  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>();
  const handleSnapshotReady = useCallback(() => setSnapshotReady(true), []);

  useEffect(() => {
    setSnapshotReady(!(showPage && snapshot));
  }, [containerWidth, showPage, snapshot]);

  if (isLoading) {
    return <CanvasLoading />;
  }

  if (!scroll || scroll.totalSessions === 0 || !scroll.pageH || !scroll.viewportW) {
    return <EmptyState message="No scroll data for this page yet." />;
  }

  const { buckets, totalSessions, pageH, viewportW, viewportH } = scroll;
  const renderWidth = Math.min(containerWidth > 0 ? containerWidth : viewportW, MAX_RENDER_WIDTH);
  const scale = renderWidth / viewportW;
  const renderHeight = Math.round(pageH * scale);
  const showSnapshot = renderWidth > 0 && showPage && !!snapshot;
  const showOverlay = !showSnapshot || snapshotReady;

  // Cumulative reach: % of sessions that scrolled at least to depth D.
  const sortedBuckets = [...buckets].sort((a, b) => a.depth - b.depth);
  let remaining = totalSessions;
  const cumulative = sortedBuckets.map(b => {
    const reached = remaining;
    remaining -= b.sessions;
    return { depth: b.depth, reached, ratio: reached / totalSessions };
  });

  // Build page-spanning bands. Each band covers a vertical slice of the page.
  // Intensity = fraction of sessions reaching the band's TOP edge (everyone who
  // got that far saw at least the start of the slice).
  type Band = { fromPct: number; toPct: number; reached: number; ratio: number };
  const bands: Band[] = [];
  const firstDepth = cumulative[0]?.depth ?? 100;
  if (firstDepth > 0) {
    bands.push({ fromPct: 0, toPct: firstDepth, reached: totalSessions, ratio: 1 });
  }
  for (let i = 0; i < cumulative.length; i++) {
    const c = cumulative[i];
    const toPct = cumulative[i + 1]?.depth ?? 100;
    if (c.depth < toPct) {
      bands.push({ fromPct: c.depth, toPct, reached: c.reached, ratio: c.ratio });
    }
  }

  return (
    <Column gap>
      <Text color="muted" title={urlPath} className={styles.summaryPath}>
        {urlPath}
      </Text>
      <Row alignItems="center" justifyContent="space-between" gap className={styles.summaryHeader}>
        <Text color="muted" className={styles.summaryStat}>
          {formatLongNumber(totalSessions)} sessions · page {viewportW}×{pageH}
          {viewportH ? ` · viewport ${viewportH}` : ''}
        </Text>
      </Row>
      <div ref={containerRef} className={styles.canvasWrapper}>
        <div
          className={styles.canvas}
          style={{ width: renderWidth || '100%', height: renderHeight || 0 }}
        >
          <div className={styles.canvasClip}>
            {showSnapshot && !snapshotReady && <CanvasLoading />}
            {showSnapshot && (
              <ReplaySnapshot
                websiteId={websiteId}
                snapshot={snapshot}
                width={viewportW}
                height={pageH}
                scale={scale}
                onReady={handleSnapshotReady}
              />
            )}
            {showOverlay && (
              <div className={styles.overlay}>
              {bands.map(b => {
                const top = Math.round((b.fromPct / 100) * renderHeight);
                const bottom = Math.round((b.toPct / 100) * renderHeight);
                const height = Math.max(0, bottom - top);
                const intensity = b.ratio;
                const hue = Math.round(60 - intensity * 60); // 60=yellow → 0=red
                return (
                  <div
                    key={b.fromPct}
                    className={styles.scrollBand}
                    style={{
                      top,
                      height,
                      background: `hsla(${hue}, 90%, 50%, ${0.15 + intensity * 0.5})`,
                    }}
                    title={`${b.fromPct}–${b.toPct}% — ${formatLongNumber(b.reached)} sessions (${Math.round(intensity * 100)}%)`}
                  >
                    <span className={styles.scrollBandLabel}>
                      {b.fromPct}% · {Math.round(intensity * 100)}%
                    </span>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>
      </div>
      {snapshot && (
        <Row justifyContent="center" className={styles.snapshotControlRow}>
          <Switch isSelected={showPage} onChange={setShowPage}>
            Show page
          </Switch>
        </Row>
      )}
    </Column>
  );
}

function ReplaySnapshot({
  websiteId,
  snapshot,
  width,
  height,
  scale,
  onReady,
}: {
  websiteId: string;
  snapshot: HeatmapSnapshot;
  width: number;
  height: number;
  scale: number;
  onReady: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<ReplayInstance | null>(null);
  const { data } = useReplayQuery(websiteId, snapshot.replayId, {
    until: snapshot.timestamp,
    chunkIndex: snapshot.chunkIndex,
    eventIndex: snapshot.eventIndex,
  }) as { data?: ReplayData };

  useEffect(() => {
    const container = containerRef.current;
    const events = data?.events;
    if (!container || !events?.length) return;

    let cancelled = false;

    import('rrweb').then(({ Replayer }) => {
      if (cancelled || !containerRef.current) return;

      container.innerHTML = '';

      const replayer = new Replayer(events, {
        root: container,
        showWarning: false,
        mouseTail: false,
        triggerFocus: false,
        pauseAnimation: true,
        useVirtualDom: false,
        loadTimeout: 3000,
      }) as ReplayInstance;

      replayerRef.current = replayer;
      let rebuilt = false;
      let waitingForStyles = false;
      let settled = false;

      const freeze = () => {
        const offset = Math.max(0, snapshot.timestamp - events[0].timestamp);
        resizeReplayFrame(replayer, width, height);
        replayer.pause(offset);
        replayer.disableInteract();
        resizeReplayFrame(replayer, width, height);
      };

      const finalize = async () => {
        if (settled || waitingForStyles || !rebuilt || cancelled) {
          return;
        }

        settled = true;

        await waitForReplayLayout(replayer);

        if (cancelled) {
          return;
        }

        freeze();
        await waitForAnimationFrames(2);

        if (cancelled) {
          return;
        }

        freeze();
        onReady();
      };

      replayer.on('load-stylesheet-start', () => {
        waitingForStyles = true;
      });

      replayer.on('load-stylesheet-end', () => {
        waitingForStyles = false;
        void finalize();
      });

      replayer.on('fullsnapshot-rebuilded', () => {
        rebuilt = true;
        void finalize();
      });

      replayer.on('resize', (dimension: { width?: number; height?: number }) => {
        resizeReplayFrame(
          replayer,
          dimension.width && Number.isFinite(dimension.width) ? dimension.width : width,
          dimension.height && Number.isFinite(dimension.height) ? dimension.height : height,
        );
      });

      setTimeout(() => {
        waitingForStyles = false;
        void finalize();
      }, 3500);
    });

    return () => {
      cancelled = true;
      if (replayerRef.current) {
        replayerRef.current.destroy();
        replayerRef.current = null;
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [data?.events, height, onReady, snapshot.timestamp, width]);

  useEffect(() => {
    if (replayerRef.current) {
      resizeReplayFrame(replayerRef.current, width, height);
    }
  }, [height, width]);

  return (
    <div
      ref={containerRef}
      className={styles.snapshot}
      style={{ width, height, transform: `scale(${scale})` }}
    />
  );
}

function CanvasLoading() {
  return (
    <div className={styles.canvasLoading}>
      <Loading icon="dots" placement="center" />
    </div>
  );
}

function waitForAnimationFrames(count = 2) {
  return new Promise<void>(resolve => {
    const step = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }

      requestAnimationFrame(() => step(remaining - 1));
    };

    step(count);
  });
}

async function waitForReplayLayout(replayer: ReplayInstance) {
  const fonts = replayer.iframe?.contentDocument?.fonts;

  if (fonts?.ready) {
    try {
      await Promise.race([
        fonts.ready.then(() => undefined),
        new Promise(resolve => setTimeout(resolve, 1500)),
      ]);
    } catch {
      // Ignore font readiness failures and fall back to frame settling.
    }
  }

  await waitForAnimationFrames(3);
}

function syncReplayDocumentViewport(replayer: ReplayInstance, width: number, height: number) {
  const doc = replayer.iframe?.contentDocument;
  const html = doc?.documentElement;
  const body = doc?.body;

  if (html) {
    html.style.margin = '0';
  }

  if (body) {
    body.style.margin = '0';
  }
}

function resizeReplayFrame(replayer: ReplayInstance, width: number, height: number) {
  const { iframe, wrapper } = replayer;

  if (wrapper) {
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    wrapper.style.overflow = 'hidden';
  }

  if (iframe) {
    iframe.setAttribute('width', String(width));
    iframe.setAttribute('height', String(height));
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.style.display = 'block';
  }

  syncReplayDocumentViewport(replayer, width, height);
}

function EmptyState({ message }: { message?: string } = {}) {
  return (
    <Column alignItems="center" justifyContent="center" minHeight="360px" gap>
      <Heading size="lg">{message ? 'No data' : 'Select a page'}</Heading>
      <Text color="muted">{message ?? 'Choose a page from the list to view its heatmap.'}</Text>
    </Column>
  );
}
