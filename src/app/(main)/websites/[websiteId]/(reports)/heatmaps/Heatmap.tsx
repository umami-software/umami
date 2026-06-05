'use client';
import { Column, Grid, Heading, Loading, Row, Switch, Text } from '@umami/react-zen';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useResultQuery } from '@/components/hooks';
import { getClientAuthToken } from '@/lib/client';
import { formatLongNumber } from '@/lib/format';
import type { HeatmapMode, HeatmapPoint, HeatmapResult, HeatmapSnapshot } from '@/queries/sql';
import styles from './Heatmap.module.css';

const CLICK_EDGE_PERCENT = 1.5;
const SCROLL_BUCKET_SIZE = 10;
const SNAPSHOT_UNAVAILABLE_ERROR = 'Page screenshot unavailable.';

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
                urlPath={urlPath}
                scroll={scroll}
                snapshot={snapshot}
                isLoading={detailLoading}
              />
            ) : (
              <ClickHeatmapView
                urlPath={urlPath}
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
  const getPageMetricTitle = (page: HeatmapResult['pages'][number]) => {
    const metricLabel = mode === 'scroll' ? 'scroll events' : 'clicks';

    return `${formatLongNumber(page.sessions)} visitors - ${formatLongNumber(page.count)} ${metricLabel}`;
  };

  return (
    <Column className={styles.pageList} gap="1">
      <Heading size="lg">Pages</Heading>
      <Column className={styles.pageListItems} gap="2">
        {pages.length === 0 && hasSearch && <Text color="muted">No matching pages</Text>}
        {pages.map(page => (
          <button
            key={page.urlPath}
            type="button"
            onClick={() => onSelect(page.urlPath)}
            title={page.urlPath}
            className={`${styles.pageButton} ${selected === page.urlPath ? styles.pageButtonSelected : ''}`}
          >
            <Row alignItems="center" justifyContent="space-between" gap="2">
              <Text truncate>{page.urlPath}</Text>
              <Text color="muted" className={styles.pageMetric} title={getPageMetricTitle(page)}>
                {formatLongNumber(page.sessions)}
              </Text>
            </Row>
          </button>
        ))}
      </Column>
    </Column>
  );
}

function pickViewport(points: HeatmapPoint[]): ViewportBucket | null {
  if (!points.length) {
    return null;
  }

  const viewportBuckets = new Map<
    string,
    ViewportBucket & { maxPageW: number; maxPageH: number }
  >();

  for (const point of points) {
    const viewportKey = `${point.viewportW}x${point.viewportH}`;
    const existing = viewportBuckets.get(viewportKey);

    if (existing) {
      existing.count += point.count;
      existing.maxPageW = Math.max(existing.maxPageW, point.pageW);
      existing.maxPageH = Math.max(existing.maxPageH, point.pageH);
      continue;
    }

    viewportBuckets.set(viewportKey, {
      width: point.viewportW,
      height: point.viewportH,
      pageW: point.pageW,
      pageH: point.pageH,
      count: point.count,
      maxPageW: point.pageW,
      maxPageH: point.pageH,
    });
  }

  let best: (ViewportBucket & { maxPageW: number; maxPageH: number }) | null = null;

  for (const bucket of viewportBuckets.values()) {
    if (!best || bucket.count > best.count) {
      best = bucket;
    }
  }

  if (!best) {
    return null;
  }

  return {
    width: best.width,
    height: best.height,
    pageW: best.maxPageW,
    pageH: best.maxPageH,
    count: best.count,
  };
}

function ClickHeatmapView({
  urlPath,
  points,
  snapshot,
  isLoading,
}: {
  urlPath: string;
  points: HeatmapPoint[];
  snapshot: HeatmapSnapshot | null;
  isLoading: boolean;
}) {
  const [showPage, setShowPage] = useState(true);
  const [snapshotReady, setSnapshotReady] = useState(false);
  const viewport = useMemo(() => pickViewport(points), [points]);

  const visible = useMemo(() => {
    if (!viewport) {
      return [];
    }

    return points.filter(
      point => point.viewportW === viewport.width && point.viewportH === viewport.height,
    );
  }, [points, viewport]);

  const maxCount = useMemo(
    () => visible.reduce((max, point) => (point.count > max ? point.count : max), 1),
    [visible],
  );

  const handleSnapshotReady = useCallback(() => setSnapshotReady(true), []);
  const hasSnapshotImage = Boolean(snapshot?.imageUrl);

  useEffect(() => {
    setSnapshotReady(!(showPage && hasSnapshotImage));
  }, [hasSnapshotImage, showPage, snapshot?.id]);
  const overlayGutter = Math.max(48, Math.round((viewport?.width ?? 1920) * 0.04));
  const maxPointX = visible.reduce((max, point) => Math.max(max, point.pageX), 0);
  const maxPointY = visible.reduce((max, point) => Math.max(max, point.pageY), 0);
  const baseWidth = Math.max(viewport?.pageW ?? 0, maxPointX + overlayGutter, 1);
  const baseHeight = Math.max(viewport?.pageH ?? 0, maxPointY + overlayGutter, 640);
  const renderWidth = snapshot?.pageW ?? baseWidth;
  const renderHeight = snapshot?.pageH ?? baseHeight;
  const hasMeasuredWidth = Boolean(snapshot?.pageW || viewport?.pageW || maxPointX);
  const canvasWidth = hasMeasuredWidth ? `min(100%, ${renderWidth}px)` : '100%';
  const overlayPageW = snapshot?.pageW ?? viewport?.pageW ?? baseWidth;
  const overlayPageH = snapshot?.pageH ?? viewport?.pageH ?? baseHeight;
  const showSnapshot = renderWidth > 0 && showPage && hasSnapshotImage;
  const showOverlay = !showSnapshot || snapshotReady;
  const totalClicks = visible.reduce((sum, point) => sum + point.count, 0);
  const showLoading = isLoading;

  return (
    <Column gap>
      <Column gap="2" className={styles.summaryHeader}>
        <Row alignItems="center" justifyContent="space-between" gap>
          <Text color="muted" title={urlPath} className={styles.summaryPath}>
            {urlPath}
          </Text>
        </Row>
        {showLoading ? (
          <Row alignItems="center" gap className={styles.summaryStats}>
            <Text color="muted" className={styles.summaryStat}>
              Loading Heatmap...
            </Text>
          </Row>
        ) : (
          <Row
            alignItems="center"
            justifyContent="space-between"
            gap
            className={styles.summaryStats}
          >
            <Text color="muted" className={styles.summaryStat}>
              {viewport
                ? `${visible.length} positions - ${formatLongNumber(totalClicks)} clicks - viewport ${viewport.width}x${viewport.height}`
                : 'No click data for this page yet.'}
            </Text>
          </Row>
        )}
      </Column>

      {showPage && snapshot?.status === 'failed' && (
        <Text color="muted" className={styles.snapshotMessage}>
          {SNAPSHOT_UNAVAILABLE_ERROR}
        </Text>
      )}

      <div className={styles.canvasWrapper}>
        <div
          className={styles.canvas}
          style={{
            width: canvasWidth,
            maxWidth: '100%',
            aspectRatio: `${Math.max(1, renderWidth)} / ${Math.max(1, renderHeight)}`,
          }}
        >
          {showLoading ? (
            <CanvasLoading />
          ) : !viewport || visible.length === 0 ? (
            <EmptyState message="No click data for this page yet." />
          ) : (
            <>
              <div className={styles.snapshotClip}>
                {showSnapshot && !snapshotReady && <CanvasLoading />}
                {showSnapshot && snapshot?.imageUrl && (
                  <SnapshotImage snapshot={snapshot} onReady={handleSnapshotReady} />
                )}
              </div>
              {showOverlay && (
                <div className={styles.overlay}>
                  {visible.map((point, index) => {
                    const intensity = Math.min(1, point.count / maxCount);
                    const desiredSize = 24 + intensity * 36;
                    const pointWidth = Math.max(overlayPageW, point.pageX);
                    const pointHeight = Math.max(overlayPageH, point.pageY);
                    const rawCenterX = (point.pageX / Math.max(1, pointWidth)) * 100;
                    const rawCenterY = (point.pageY / Math.max(1, pointHeight)) * 100;
                    const size = desiredSize;
                    const centerX = Math.max(
                      CLICK_EDGE_PERCENT,
                      Math.min(100 - CLICK_EDGE_PERCENT, rawCenterX),
                    );
                    const centerY = Math.max(
                      CLICK_EDGE_PERCENT,
                      Math.min(100 - CLICK_EDGE_PERCENT, rawCenterY),
                    );

                    return (
                      <div
                        key={`${point.pageX}-${point.pageY}-${index}`}
                        className={styles.dot}
                        style={{
                          left: `${centerX}%`,
                          top: `${centerY}%`,
                          width: size,
                          height: size,
                          transform: 'translate(-50%, -50%)',
                          opacity: 0.25 + intensity * 0.55,
                        }}
                        title={`${point.count} click${point.count === 1 ? '' : 's'}`}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {hasSnapshotImage && (
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
  scroll,
  snapshot,
  isLoading,
}: {
  urlPath: string;
  scroll: HeatmapResult['scroll'] | undefined;
  snapshot: HeatmapSnapshot | null;
  isLoading: boolean;
}) {
  const [showPage, setShowPage] = useState(true);
  const [snapshotReady, setSnapshotReady] = useState(false);
  const handleSnapshotReady = useCallback(() => setSnapshotReady(true), []);
  const hasSnapshotImage = Boolean(snapshot?.imageUrl);

  useEffect(() => {
    setSnapshotReady(!(showPage && hasSnapshotImage));
  }, [hasSnapshotImage, showPage, snapshot?.id]);
  const {
    buckets = [],
    totalSessions = 0,
    pageW = 0,
    pageH = 0,
    viewportW = 0,
    viewportH = 0,
  } = scroll ?? {};
  const baseWidth = Math.max(pageW, 1);
  const baseHeight = Math.max(pageH, 640);
  const renderWidth = snapshot?.pageW ?? baseWidth;
  const renderHeight = snapshot?.pageH ?? baseHeight;
  const hasMeasuredWidth = Boolean(snapshot?.pageW || pageW);
  const canvasWidth = hasMeasuredWidth ? `min(100%, ${renderWidth}px)` : '100%';
  const showSnapshot = renderWidth > 0 && showPage && hasSnapshotImage;
  const showOverlay = !showSnapshot || snapshotReady;
  const hasScrollData = Boolean(scroll && totalSessions > 0 && pageW && pageH && viewportW);
  const showLoading = isLoading;

  type Band = { fromPct: number; toPct: number; reached: number; ratio: number };
  const bands: Band[] = [];
  const sessionsByDepth = new Map(buckets.map(bucket => [bucket.depth, bucket.sessions]));
  let dropped = 0;

  for (let depth = 0; depth < 100; depth += SCROLL_BUCKET_SIZE) {
    const reached = Math.max(0, totalSessions - dropped);
    dropped += sessionsByDepth.get(depth) ?? 0;
    const nextReached = Math.max(0, totalSessions - dropped);
    const ratio = totalSessions ? nextReached / totalSessions : 0;

    if (reached > 0) {
      bands.push({
        fromPct: depth,
        toPct: Math.min(100, depth + SCROLL_BUCKET_SIZE),
        reached: nextReached,
        ratio,
      });
    }
  }

  return (
    <Column gap>
      <Text color="muted" title={urlPath} className={styles.summaryPath}>
        {urlPath}
      </Text>
      {showLoading ? (
        <Row alignItems="center" gap className={styles.summaryStats}>
          <Text color="muted" className={styles.summaryStat}>
            Loading Heatmap...
          </Text>
        </Row>
      ) : (
        <Row
          alignItems="center"
          justifyContent="space-between"
          gap
          className={styles.summaryHeader}
        >
          <Text color="muted" className={styles.summaryStat}>
            {hasScrollData
              ? `${formatLongNumber(totalSessions)} sessions - page ${pageW}x${pageH}${viewportH ? ` - viewport ${viewportW}x${viewportH}` : ''}`
              : 'No scroll data for this page yet.'}
          </Text>
        </Row>
      )}

      {showPage && snapshot?.status === 'failed' && (
        <Text color="muted" className={styles.snapshotMessage}>
          {SNAPSHOT_UNAVAILABLE_ERROR}
        </Text>
      )}

      <div className={styles.canvasWrapper}>
        <div
          className={styles.canvas}
          style={{
            width: canvasWidth,
            maxWidth: '100%',
            aspectRatio: `${Math.max(1, renderWidth)} / ${Math.max(1, renderHeight)}`,
          }}
        >
          {showLoading ? (
            <CanvasLoading />
          ) : !hasScrollData ? (
            <EmptyState message="No scroll data for this page yet." />
          ) : (
            <div className={styles.canvasClip}>
              {showSnapshot && !snapshotReady && <CanvasLoading />}
              {showSnapshot && snapshot?.imageUrl && (
                <SnapshotImage snapshot={snapshot} onReady={handleSnapshotReady} />
              )}
              {showOverlay && (
                <div className={styles.overlay}>
                  {bands.map(band => {
                    const intensity = band.ratio;
                    const hue = Math.round(60 - intensity * 60);

                    return (
                      <div
                        key={band.fromPct}
                        className={styles.scrollBand}
                        style={{
                          top: `${band.fromPct}%`,
                          height: `${Math.max(0, band.toPct - band.fromPct)}%`,
                          background:
                            intensity > 0
                              ? `hsla(${hue}, 90%, 55%, ${0.12 + intensity * 0.45})`
                              : 'none',
                        }}
                        title={`${band.toPct}% depth - ${formatLongNumber(band.reached)} sessions reached`}
                      >
                        <span className={styles.scrollBandLabel}>
                          {band.toPct}% depth - {Math.round(intensity * 100)}% reached
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {hasSnapshotImage && (
        <Row justifyContent="center" className={styles.snapshotControlRow}>
          <Switch isSelected={showPage} onChange={setShowPage}>
            Show page
          </Switch>
        </Row>
      )}
    </Column>
  );
}

function SnapshotImage({ snapshot, onReady }: { snapshot: HeatmapSnapshot; onReady: () => void }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!snapshot.imageUrl) {
      setSrc(null);
      return;
    }

    const controller = new AbortController();
    const token = getClientAuthToken();
    let objectUrl: string | null = null;

    setSrc(null);

    fetch(snapshot.imageUrl, {
      signal: controller.signal,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`Snapshot image request failed: ${response.status}`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        setSrc(null);
        onReady();
      });

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [snapshot.id, snapshot.imageUrl]);

  const handleLoad = useCallback(() => onReady(), [onReady]);

  return (
    <div className={styles.snapshot}>
      <img
        className={styles.snapshotImage}
        src={src || undefined}
        alt=""
        draggable={false}
        onLoad={handleLoad}
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

function EmptyState({ message }: { message?: string } = {}) {
  return (
    <Column alignItems="center" justifyContent="center" minHeight="360px" gap>
      {!message && <Heading size="lg">Select a page</Heading>}
      <Text color="muted">{message ?? 'Choose a page from the list to view its heatmap.'}</Text>
    </Column>
  );
}
