'use client';
import { Column, Grid, Heading, Loading, Row, Switch, Text } from '@umami/react-zen';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useResultQuery } from '@/components/hooks';
import { useReplayQuery } from '@/components/hooks/queries/useReplayQuery';
import { formatLongNumber } from '@/lib/format';
import type { HeatmapMode, HeatmapPoint, HeatmapResult, HeatmapSnapshot } from '@/queries/sql';
import styles from './Heatmap.module.css';
import 'rrweb/dist/replay/rrweb-replay.css';

const MAX_FIXED_WIDTH_OVERRUN = 160;
const CLICK_EDGE_PADDING = 4;

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setWidth(el.getBoundingClientRect().width || el.clientWidth || 0);

    const ro = new ResizeObserver(entries => {
      const nextWidth = entries[0]?.contentRect.width ?? 0;
      setWidth(nextWidth);
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
  pageW: number;
  pageH: number;
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

  if (!isLoading && pages.length === 0) {
    return (
      <LoadingPanel data={pagesData} isLoading={isLoading} error={error} minHeight="900px">
        <EmptyState message="No data available." />
      </LoadingPanel>
    );
  }

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
  return (
    <Column className={styles.pageList} gap="1">
      <Heading size="lg">Pages</Heading>
      <Column className={styles.pageListItems} gap="2">
        {pages.length === 0 && hasSearch && <Text color="muted">No matching pages</Text>}
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
  const viewportBuckets = new Map<
    string,
    ViewportBucket & { maxPageW: number; maxPageH: number }
  >();
  for (const p of points) {
    const viewportKey = `${p.viewportW}x${p.viewportH}`;
    const existing = viewportBuckets.get(viewportKey);
    if (existing) {
      existing.count += p.count;
      existing.maxPageW = Math.max(existing.maxPageW, p.pageW);
      existing.maxPageH = Math.max(existing.maxPageH, p.pageH);
    } else {
      viewportBuckets.set(viewportKey, {
        width: p.viewportW,
        height: p.viewportH,
        pageW: p.pageW,
        pageH: p.pageH,
        count: p.count,
        maxPageW: p.pageW,
        maxPageH: p.pageH,
      });
    }
  }
  let best: (ViewportBucket & { maxPageW: number; maxPageH: number }) | null = null;
  for (const b of viewportBuckets.values()) {
    if (!best || b.count > best.count) best = b;
  }
  if (!best) return null;

  return {
    width: best.width,
    height: best.height,
    pageW: best.maxPageW,
    pageH: best.maxPageH,
    count: best.count,
  };
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
  }, [showPage, snapshot]);

  if (isLoading) {
    return <CanvasLoading />;
  }

  if (!viewport || visible.length === 0) {
    return <EmptyState />;
  }

  const overlayGutter = Math.max(48, Math.round(viewport.width * 0.04));
  const maxPointX = visible.reduce((max, point) => Math.max(max, point.pageX), 0);
  const maxPointY = visible.reduce((max, point) => Math.max(max, point.pageY), 0);
  const baseWidth = Math.max(viewport.pageW, maxPointX + overlayGutter);
  const baseHeight = Math.max(viewport.pageH, maxPointY + overlayGutter);
  const renderWidth = containerWidth > 0 ? Math.min(baseWidth, containerWidth) : baseWidth;
  const scale = renderWidth / baseWidth;
  const renderHeight = Math.round(baseHeight * scale);
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
          <div className={styles.snapshotClip}>
            {showSnapshot && !snapshotReady && <CanvasLoading />}
            {showSnapshot && (
              <ReplaySnapshot
                websiteId={websiteId}
                snapshot={snapshot}
                width={baseWidth}
                height={baseHeight}
                scale={scale}
                allowWidthExpansion={viewport.pageW > viewport.width}
                onReady={handleSnapshotReady}
              />
            )}
          </div>
          {showOverlay && (
            <div className={styles.overlay}>
              {visible.map((p, i) => {
                const intensity = Math.min(1, p.count / maxCount);
                const desiredSize = 24 + intensity * 36;
                const pointWidth = Math.max(baseWidth, p.pageW || 0, p.pageX);
                const pointHeight = Math.max(baseHeight, p.pageH || 0, p.pageY);
                const rawCenterX = (p.pageX / Math.max(1, pointWidth)) * renderWidth;
                const rawCenterY = (p.pageY / Math.max(1, pointHeight)) * renderHeight;
                const size = desiredSize;
                const centerX = Math.max(
                  size / 2 + CLICK_EDGE_PADDING,
                  Math.min(renderWidth - size / 2 - CLICK_EDGE_PADDING, rawCenterX),
                );
                const centerY = Math.max(
                  size / 2 + CLICK_EDGE_PADDING,
                  Math.min(renderHeight - size / 2 - CLICK_EDGE_PADDING, rawCenterY),
                );
                return (
                  <div
                    key={`${p.pageX}-${p.pageY}-${i}`}
                    className={styles.dot}
                    style={{
                      left: centerX - size / 2,
                      top: centerY - size / 2,
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
  }, [showPage, snapshot]);

  if (isLoading) {
    return <CanvasLoading />;
  }

  if (!scroll || scroll.totalSessions === 0 || !scroll.pageW || !scroll.pageH || !scroll.viewportW) {
    return <EmptyState message="No scroll data for this page yet." />;
  }

  const { buckets, totalSessions, pageW, pageH, viewportW, viewportH } = scroll;
  const baseWidth = pageW;
  const baseHeight = pageH;
  const renderWidth = containerWidth > 0 ? Math.min(baseWidth, containerWidth) : baseWidth;
  const scale = renderWidth / baseWidth;
  const renderHeight = Math.round(baseHeight * scale);
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
                width={pageW}
                height={pageH}
                scale={scale}
                allowWidthExpansion={pageW > viewportW}
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
  allowWidthExpansion = true,
  onReady,
}: {
  websiteId: string;
  snapshot: HeatmapSnapshot;
  width: number;
  height: number;
  scale: number;
  allowWidthExpansion?: boolean;
  onReady: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<ReplayInstance | null>(null);
  const contentWidthRef = useRef(width);
  const [contentWidth, setContentWidth] = useState(width);
  const { data } = useReplayQuery(websiteId, snapshot.replayId, {
    until: snapshot.timestamp,
    chunkIndex: snapshot.chunkIndex,
    eventIndex: snapshot.eventIndex,
  }) as { data?: ReplayData };

  useEffect(() => {
    contentWidthRef.current = width;
    setContentWidth(width);
  }, [
    snapshot.chunkIndex,
    snapshot.eventIndex,
    snapshot.replayId,
    snapshot.timestamp,
    width,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    const events = data?.events;
    if (!container || !events?.length) return;

    let cancelled = false;
    let finalizeTimer: ReturnType<typeof setTimeout> | null = null;
    let readyTimer: ReturnType<typeof setTimeout> | null = null;
    let widthObserver: ResizeObserver | null = null;

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
      let finalizeToken = 0;
      let observingWidth = false;

      const getBoundedWidth = (nextWidth: number) => {
        const maxWidth = allowWidthExpansion ? Number.POSITIVE_INFINITY : width + MAX_FIXED_WIDTH_OVERRUN;
        return Math.min(Math.max(width, nextWidth), maxWidth);
      };

      const commitWidth = (nextWidth: number) => {
        const stableWidth = Math.max(contentWidthRef.current, getBoundedWidth(nextWidth), width);

        if (stableWidth === contentWidthRef.current) {
          return;
        }

        contentWidthRef.current = stableWidth;
        resizeReplayFrame(replayer, stableWidth, height);
        setContentWidth(stableWidth);
      };

      const scheduleReady = (delay = 250) => {
        if (cancelled) {
          return;
        }

        if (readyTimer) {
          clearTimeout(readyTimer);
        }

        readyTimer = setTimeout(() => {
          readyTimer = null;
          if (!cancelled) {
            onReady();
          }
        }, delay);
      };

      const startWidthObserver = () => {
        if (observingWidth || cancelled) {
          return;
        }

        const doc = replayer.iframe?.contentDocument;
        const html = doc?.documentElement;
        const body = doc?.body;

        if (!html && !body) {
          return;
        }

        observingWidth = true;
        widthObserver = new ResizeObserver(() => {
          commitWidth(measureReplayWidth(replayer, width));
          scheduleReady();
        });

        if (html) {
          widthObserver.observe(html);
        }

        if (body) {
          widthObserver.observe(body);
        }
      };

      const freeze = () => {
        const offset = Math.max(0, snapshot.timestamp - events[0].timestamp);
        resizeReplayFrame(replayer, width, height);
        replayer.pause(offset);
        replayer.disableInteract();
        resizeReplayFrame(replayer, width, height);
      };

      const finalize = async (token: number) => {
        if (waitingForStyles || !rebuilt || cancelled) {
          return;
        }

        await waitForReplayLayout(replayer);

        if (cancelled || token !== finalizeToken) {
          return;
        }

        freeze();
        await waitForAnimationFrames(2);

        if (cancelled || token !== finalizeToken) {
          return;
        }

        freeze();
        await waitForAnimationFrames(2);

        if (cancelled || token !== finalizeToken) {
          return;
        }

        commitWidth(
          await measureStableReplayWidth(replayer, width, {
          maxWidth: allowWidthExpansion ? undefined : width + MAX_FIXED_WIDTH_OVERRUN,
          samples: 12,
        }),
        );

        if (cancelled || token !== finalizeToken) {
          return;
        }

        startWidthObserver();
        scheduleReady();
      };

      const scheduleFinalize = (delay = 250) => {
        if (cancelled) {
          return;
        }

        finalizeToken += 1;
        const token = finalizeToken;

        if (finalizeTimer) {
          clearTimeout(finalizeTimer);
        }

        finalizeTimer = setTimeout(() => {
          finalizeTimer = null;
          void finalize(token);
        }, delay);
      };

      replayer.on('load-stylesheet-start', () => {
        waitingForStyles = true;
      });

      replayer.on('load-stylesheet-end', () => {
        waitingForStyles = false;
        scheduleFinalize();
      });

      replayer.on('fullsnapshot-rebuilded', () => {
        rebuilt = true;
        scheduleFinalize();
      });

      replayer.on('resize', () => {
        scheduleFinalize();
      });

      setTimeout(() => {
        waitingForStyles = false;
        scheduleFinalize(0);
      }, 3500);
    });

    return () => {
      cancelled = true;
      if (finalizeTimer) {
        clearTimeout(finalizeTimer);
      }
      if (readyTimer) {
        clearTimeout(readyTimer);
      }
      if (widthObserver) {
        widthObserver.disconnect();
      }
      if (replayerRef.current) {
        replayerRef.current.destroy();
        replayerRef.current = null;
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [allowWidthExpansion, data?.events, height, onReady, snapshot.timestamp, width]);

  useEffect(() => {
    if (replayerRef.current) {
      resizeReplayFrame(replayerRef.current, contentWidth, height);
    }
  }, [contentWidth, height]);

  const fitScaleX = contentWidth > width ? width / Math.max(1, contentWidth) : 1;
  const snapshotScaleX = scale * fitScaleX;

  return (
    <div
      className={styles.snapshot}
      style={{
        width: contentWidth,
        height,
        transform: `scale(${snapshotScaleX}, ${scale})`,
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: contentWidth,
          height,
        }}
      />
    </div>
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

async function measureStableReplayWidth(
  replayer: ReplayInstance,
  fallbackWidth: number,
  { maxWidth, samples = 6 }: { maxWidth?: number; samples?: number } = {},
) {
  let stableWidth = fallbackWidth;

  for (let i = 0; i < samples; i++) {
    await waitForAnimationFrames(1);
    stableWidth = Math.max(stableWidth, measureReplayWidth(replayer, fallbackWidth));
  }

  return maxWidth ? Math.min(stableWidth, maxWidth) : stableWidth;
}

function syncReplayDocumentViewport(replayer: ReplayInstance) {
  const doc = replayer.iframe?.contentDocument;
  const html = doc?.documentElement;
  const body = doc?.body;

  if (html) {
    html.style.margin = '0';
    html.style.overflowX = 'visible';
    html.style.overflowY = 'hidden';
  }

  if (body) {
    body.style.margin = '0';
    body.style.overflowX = 'visible';
    body.style.overflowY = 'hidden';
  }
}

function resizeReplayFrame(replayer: ReplayInstance, width: number, height: number) {
  const { iframe, wrapper } = replayer;

  if (wrapper) {
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    wrapper.style.minWidth = `${width}px`;
    wrapper.style.minHeight = `${height}px`;
    wrapper.style.maxWidth = `${width}px`;
    wrapper.style.maxHeight = `${height}px`;
    wrapper.style.margin = '0';
    wrapper.style.padding = '0';
    wrapper.style.overflow = 'visible';
  }

  if (iframe) {
    iframe.setAttribute('width', String(width));
    iframe.setAttribute('height', String(height));
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.style.minWidth = `${width}px`;
    iframe.style.minHeight = `${height}px`;
    iframe.style.maxWidth = `${width}px`;
    iframe.style.maxHeight = `${height}px`;
    iframe.style.margin = '0';
    iframe.style.display = 'block';
  }

  syncReplayDocumentViewport(replayer);
}

function measureReplayWidth(replayer: ReplayInstance, fallbackWidth: number) {
  const doc = replayer.iframe?.contentDocument;
  const win = replayer.iframe?.contentWindow;
  const root = doc?.documentElement as HTMLElement | undefined;
  const body = doc?.body as HTMLElement | undefined;
  const scrollingElement = doc?.scrollingElement as HTMLElement | undefined;
  const firstChild = body?.firstElementChild as HTMLElement | null;
  const wrapperWidth = replayer.wrapper?.scrollWidth || replayer.wrapper?.offsetWidth || 0;
  const iframeWidth = replayer.iframe?.scrollWidth || replayer.iframe?.offsetWidth || 0;

  return Math.round(
    Math.max(
      fallbackWidth,
      measureDocumentWidth(doc),
      wrapperWidth,
      iframeWidth,
      win?.innerWidth || 0,
      measureElementWidth(root),
      measureElementWidth(body),
      measureElementWidth(scrollingElement),
      measureElementWidth(firstChild || undefined),
    ),
  );
}

function measureDocumentWidth(doc?: Document | null) {
  const body = doc?.body;

  if (!body) {
    return 0;
  }

  let maxRight = 0;
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);
  let node = walker.currentNode as Element | null;

  while (node) {
    const rect = node.getBoundingClientRect?.();

    if (rect && rect.width > 0) {
      maxRight = Math.max(maxRight, rect.right);
    }

    node = walker.nextNode() as Element | null;
  }

  return Math.max(0, Math.round(maxRight));
}

function measureElementWidth(element?: HTMLElement | null) {
  if (!element) {
    return 0;
  }

  const rect = element.getBoundingClientRect();

  return Math.max(element.scrollWidth, element.offsetWidth, element.clientWidth, rect.width);
}

function EmptyState({ message }: { message?: string } = {}) {
  return (
    <Column alignItems="center" justifyContent="center" minHeight="360px" gap>
      {!message && <Heading size="lg">Select a page</Heading>}
      <Text color="muted">{message ?? 'Choose a page from the list to view its heatmap.'}</Text>
    </Column>
  );
}
