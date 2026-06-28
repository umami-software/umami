'use client';
import {
  Column,
  Grid,
  Heading,
  Icon,
  ListItem,
  Loading,
  Row,
  Select,
  Text,
} from '@umami/react-zen';
import { Laptop, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useResultQuery } from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import type { HeatmapMode, HeatmapPoint, HeatmapResult, HeatmapSnapshot } from '@/queries/sql';
import styles from './Heatmap.module.css';

const SCROLL_BUCKET_SIZE = 10;
const SCREEN_WIDTH_BUCKETS = [320, 375, 425, 768, 1024, 1440, 1920] as const;

interface ScreenWidthBucket {
  width: number;
  viewportH: number;
  pageW: number;
  pageH: number;
  positions: number;
  count: number;
  minViewportW: number;
  maxViewportW: number;
}

interface ScreenWidthMetric {
  pageW: number;
  pageH: number;
  viewportW: number;
  viewportH: number;
  count: number;
}

interface ScreenWidthBucketOptions {
  pageSize?: 'max' | 'weightedAverage';
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

function getScreenWidthBucketWidth(viewportW: number) {
  return SCREEN_WIDTH_BUCKETS.reduce((best, width) => {
    const bestDistance = Math.abs(viewportW - best);
    const distance = Math.abs(viewportW - width);

    return distance < bestDistance ? width : best;
  }, SCREEN_WIDTH_BUCKETS[0]);
}

function getScreenWidthBuckets(
  metrics: ScreenWidthMetric[],
  options: ScreenWidthBucketOptions = {},
): ScreenWidthBucket[] {
  if (!metrics.length) {
    return [];
  }

  const buckets = new Map<
    number,
    ScreenWidthBucket & {
      weightedPageW: number;
      weightedPageH: number;
      weightedViewportH: number;
    }
  >();
  const pageSize = options.pageSize ?? 'max';

  for (const metric of metrics) {
    const width = getScreenWidthBucketWidth(metric.viewportW);
    const scale = width / Math.max(1, metric.viewportW);
    const scaledViewportH = metric.viewportH * scale;
    const scaledPageW = Math.max(width, metric.pageW * scale);
    const scaledPageH = Math.max(scaledViewportH, metric.pageH * scale);
    const existing = buckets.get(width);

    if (existing) {
      existing.positions += 1;
      existing.count += metric.count;
      existing.pageW = Math.max(existing.pageW, scaledPageW);
      existing.pageH = Math.max(existing.pageH, scaledPageH);
      existing.weightedPageW += scaledPageW * metric.count;
      existing.weightedPageH += scaledPageH * metric.count;
      existing.weightedViewportH += scaledViewportH * metric.count;
      existing.minViewportW = Math.min(existing.minViewportW, metric.viewportW);
      existing.maxViewportW = Math.max(existing.maxViewportW, metric.viewportW);
      continue;
    }

    buckets.set(width, {
      width,
      viewportH: scaledViewportH,
      pageW: scaledPageW,
      pageH: scaledPageH,
      positions: 1,
      count: metric.count,
      minViewportW: metric.viewportW,
      maxViewportW: metric.viewportW,
      weightedPageW: scaledPageW * metric.count,
      weightedPageH: scaledPageH * metric.count,
      weightedViewportH: scaledViewportH * metric.count,
    });
  }

  return SCREEN_WIDTH_BUCKETS.map(width => buckets.get(width))
    .filter(
      (
        bucket,
      ): bucket is ScreenWidthBucket & {
        weightedPageW: number;
        weightedPageH: number;
        weightedViewportH: number;
      } => Boolean(bucket),
    )
    .map(({ weightedPageW, weightedPageH, weightedViewportH, ...bucket }) => ({
      ...bucket,
      viewportH: Math.max(1, Math.round(weightedViewportH / Math.max(1, bucket.count))),
      pageW: Math.max(
        bucket.width,
        Math.round(
          pageSize === 'weightedAverage' ? weightedPageW / Math.max(1, bucket.count) : bucket.pageW,
        ),
      ),
      pageH: Math.max(
        640,
        Math.round(
          pageSize === 'weightedAverage' ? weightedPageH / Math.max(1, bucket.count) : bucket.pageH,
        ),
      ),
    }));
}

function getDefaultScreenWidthBucket(buckets: ScreenWidthBucket[]) {
  return buckets.reduce<ScreenWidthBucket | null>(
    (best, bucket) => (!best || bucket.count > best.count ? bucket : best),
    null,
  );
}

function normalizePointToBucket(point: HeatmapPoint, bucket: ScreenWidthBucket): HeatmapPoint {
  const scale = bucket.width / Math.max(1, point.viewportW);
  const viewportH = Math.max(1, Math.round(point.viewportH * scale));

  return {
    ...point,
    x: point.x * scale,
    y: point.y * scale,
    pageX: point.pageX * scale,
    pageY: point.pageY * scale,
    pageW: Math.max(bucket.width, point.pageW * scale),
    pageH: Math.max(viewportH, point.pageH * scale),
    viewportW: bucket.width,
    viewportH,
  };
}

function getNormalizedBucketPoints(points: HeatmapPoint[], bucket: ScreenWidthBucket) {
  const groupedPoints = new Map<string, HeatmapPoint>();

  for (const point of points) {
    if (getScreenWidthBucketWidth(point.viewportW) !== bucket.width) {
      continue;
    }

    const normalized = normalizePointToBucket(point, bucket);
    const pageX = Math.round(normalized.pageX);
    const pageY = Math.round(normalized.pageY);
    const key = `${pageX}:${pageY}`;
    const existing = groupedPoints.get(key);

    if (existing) {
      existing.count += normalized.count;
      existing.pageW = Math.max(existing.pageW, normalized.pageW);
      existing.pageH = Math.max(existing.pageH, normalized.pageH);
      continue;
    }

    groupedPoints.set(key, {
      ...normalized,
      x: Math.round(normalized.x),
      y: Math.round(normalized.y),
      pageX,
      pageY,
    });
  }

  return Array.from(groupedPoints.values());
}

function useSelectedScreenWidthBucket(screenWidthBuckets: ScreenWidthBucket[]) {
  const [selectedScreenWidth, setSelectedScreenWidth] = useState<number | null>(null);
  const defaultScreenWidth = useMemo(
    () => getDefaultScreenWidthBucket(screenWidthBuckets)?.width ?? null,
    [screenWidthBuckets],
  );

  useEffect(() => {
    const availableWidths = new Set(screenWidthBuckets.map(bucket => bucket.width));

    setSelectedScreenWidth(current => {
      if (!defaultScreenWidth) {
        return null;
      }

      return current && availableWidths.has(current) ? current : defaultScreenWidth;
    });
  }, [defaultScreenWidth, screenWidthBuckets]);

  const viewport = useMemo(() => {
    const activeWidth = selectedScreenWidth ?? defaultScreenWidth;

    return screenWidthBuckets.find(bucket => bucket.width === activeWidth) ?? null;
  }, [defaultScreenWidth, screenWidthBuckets, selectedScreenWidth]);

  return { viewport, setSelectedScreenWidth };
}

function getScrollScreenWidthMetrics(scroll: HeatmapResult['scroll'] | undefined) {
  return (
    scroll?.buckets.map(bucket => ({
      pageW: bucket.pageW,
      pageH: bucket.pageH,
      viewportW: bucket.viewportW,
      viewportH: bucket.viewportH,
      count: bucket.sessions,
    })) ?? []
  );
}

function getSelectedScrollBuckets(
  scroll: HeatmapResult['scroll'] | undefined,
  bucket: ScreenWidthBucket | null,
) {
  if (!scroll || !bucket) {
    return [];
  }

  const sessionsByDepth = new Map<number, number>();

  for (const row of scroll.buckets) {
    if (getScreenWidthBucketWidth(row.viewportW) !== bucket.width) {
      continue;
    }

    sessionsByDepth.set(row.depth, (sessionsByDepth.get(row.depth) ?? 0) + row.sessions);
  }

  return Array.from(sessionsByDepth.entries())
    .map(([depth, sessions]) => ({ depth, sessions }))
    .sort((a, b) => a.depth - b.depth);
}

function useCanvasFit(renderWidth: number, renderHeight: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const updateAvailableSize = () => {
      const width = wrapperRef.current?.clientWidth ?? 0;

      setAvailableWidth(current => (current === width ? current : width));
    };

    updateAvailableSize();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateAvailableSize) : null;

    if (wrapperRef.current && resizeObserver) {
      resizeObserver.observe(wrapperRef.current);
    }

    window.addEventListener('resize', updateAvailableSize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateAvailableSize);
    };
  }, []);

  const safeWidth = Math.max(1, renderWidth);
  const safeHeight = Math.max(1, renderHeight);
  const scale = availableWidth ? Math.min(1, availableWidth / safeWidth) : 1;

  return {
    wrapperRef,
    scale,
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
  };
}

function ScreenWidthSelect({
  buckets,
  value,
  onChange,
}: {
  buckets: ScreenWidthBucket[];
  value: number | null;
  onChange: (value: number) => void;
}) {
  const bucketsByWidth = useMemo(
    () => new Map(buckets.map(bucket => [bucket.width, bucket])),
    [buckets],
  );

  if (!value || buckets.length === 0) {
    return null;
  }

  return (
    <Row alignItems="center" gap="2" className={styles.screenWidthControl}>
      <Text color="muted" className={styles.screenWidthLabel}>
        Screen width:
      </Text>
      <Select
        aria-label="Screen width"
        value={value}
        onChange={nextValue => onChange(Number(nextValue))}
        maxHeight={420}
        renderValue={() => <ScreenWidthValue width={value} />}
        buttonProps={{
          style: {
            minHeight: 36,
            minWidth: 132,
          },
        }}
        listProps={{
          style: {
            width: 176,
          },
        }}
      >
        {SCREEN_WIDTH_BUCKETS.map(width => {
          const bucket = bucketsByWidth.get(width);

          return (
            <ListItem key={width} id={width} isDisabled={!bucket}>
              <Row alignItems="center" justifyContent="space-between" gap="2">
                <ScreenWidthValue width={width} />
                {bucket && (
                  <Text color="muted" className={styles.screenWidthCount}>
                    {formatLongNumber(bucket.count)}
                  </Text>
                )}
              </Row>
            </ListItem>
          );
        })}
      </Select>
    </Row>
  );
}

function ScreenWidthValue({ width }: { width: number }) {
  return (
    <Row alignItems="center" gap="2" className={styles.screenWidthValue}>
      <ScreenWidthIcon width={width} />
      <Text>{width} px</Text>
    </Row>
  );
}

function ScreenWidthIcon({ width }: { width: number }) {
  const DeviceIcon =
    width < 768 ? Smartphone : width < 1200 ? Tablet : width < 1600 ? Laptop : Monitor;

  return (
    <Icon size="sm">
      <DeviceIcon />
    </Icon>
  );
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
  const [snapshotReady, setSnapshotReady] = useState(false);
  const screenWidthBuckets = useMemo(() => getScreenWidthBuckets(points), [points]);
  const { viewport, setSelectedScreenWidth } = useSelectedScreenWidthBucket(screenWidthBuckets);

  const visible = useMemo(() => {
    if (!viewport) {
      return [];
    }

    return getNormalizedBucketPoints(points, viewport);
  }, [points, viewport]);

  const maxCount = useMemo(
    () => visible.reduce((max, point) => (point.count > max ? point.count : max), 1),
    [visible],
  );

  const handleSnapshotReady = useCallback(() => setSnapshotReady(true), []);
  const hasSnapshot = Boolean(snapshot);

  useEffect(() => {
    setSnapshotReady(!hasSnapshot);
  }, [hasSnapshot, snapshot?.id]);
  const overlayGutter = Math.max(48, Math.round((viewport?.width ?? 1920) * 0.04));
  const maxPointX = visible.reduce((max, point) => Math.max(max, point.pageX), 0);
  // Size the canvas to the actual page content (snapshot/viewport height) only.
  // Outlier clicks recorded far below the real content are clipped by the
  // canvas's `overflow: hidden` rather than stretching the canvas and leaving a
  // large empty band at the bottom.
  const baseWidth = Math.max(viewport?.pageW ?? 0, maxPointX + overlayGutter, 1);
  const renderWidth = viewport?.width ?? snapshot?.viewportW ?? baseWidth;
  // When we have a snapshot, its captured page height is the authoritative
  // content height (it ends at the real page bottom). Use it directly so the
  // canvas isn't stretched by an inflated aggregate `viewport.pageH` from tall
  // outlier sessions. Outlier click dots below the content are clipped by the
  // canvas's `overflow: hidden`. Fall back to the aggregate height only when no
  // snapshot is available.
  const contentHeight = snapshot?.pageH || viewport?.pageH || 0;
  const renderHeight = Math.max(contentHeight, 640);
  const hasMeasuredWidth = Boolean(viewport?.width || snapshot?.viewportW || maxPointX);
  const fit = useCanvasFit(renderWidth, renderHeight);
  const canvasWidth = hasMeasuredWidth ? `${fit.width}px` : '100%';
  const canvasHeight = hasMeasuredWidth ? `${fit.height}px` : undefined;
  const overlayPageW = renderWidth;
  const shouldRenderSnapshot = renderWidth > 0 && hasSnapshot;
  const showOverlay = !shouldRenderSnapshot || snapshotReady;
  const totalClicks = visible.reduce((sum, point) => sum + point.count, 0);
  const bucketDescription = viewport
    ? viewport.minViewportW === viewport.maxViewportW
      ? `Recorded at ${viewport.minViewportW}px wide`
      : `Grouped recorded widths from ${viewport.minViewportW}px to ${viewport.maxViewportW}px`
    : undefined;
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
            <Text color="muted" className={styles.summaryStat} title={bucketDescription}>
              {viewport
                ? `${visible.length} positions - ${formatLongNumber(totalClicks)} clicks`
                : 'No click data for this page yet.'}
            </Text>
            <ScreenWidthSelect
              buckets={screenWidthBuckets}
              value={viewport?.width ?? null}
              onChange={setSelectedScreenWidth}
            />
          </Row>
        )}
      </Column>

      <div ref={fit.wrapperRef} className={styles.canvasWrapper}>
        <div
          className={styles.canvas}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            aspectRatio: `${Math.max(1, renderWidth)} / ${Math.max(1, renderHeight)}`,
          }}
        >
          {showLoading ? (
            <CanvasLoading />
          ) : !viewport || visible.length === 0 ? (
            <EmptyState message="No click data for this page yet." />
          ) : (
            <div
              className={styles.canvasSurface}
              style={{
                width: Math.max(1, renderWidth),
                height: Math.max(1, renderHeight),
                transform: `scale(${fit.scale})`,
              }}
            >
              <div className={styles.snapshotClip}>
                {shouldRenderSnapshot && !snapshotReady && <CanvasLoading />}
                {shouldRenderSnapshot && snapshot && (
                  <SnapshotPreview snapshot={snapshot} onReady={handleSnapshotReady} />
                )}
              </div>
              {showOverlay && (
                <div className={styles.overlay}>
                  {visible.map((point, index) => {
                    const intensity = Math.min(1, point.count / maxCount);
                    const desiredSize = 24 + intensity * 36;
                    const size = desiredSize;
                    const centerX = Math.max(0, Math.min(overlayPageW, point.pageX));
                    // Don't clamp to the canvas height: points below the real
                    // content overflow and are clipped by the canvas instead of
                    // piling up on the bottom edge.
                    const centerY = Math.max(0, point.pageY);

                    return (
                      <div
                        key={`${point.pageX}-${point.pageY}-${index}`}
                        className={styles.dot}
                        style={{
                          left: centerX,
                          top: centerY,
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
            </div>
          )}
        </div>
      </div>
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
  const [snapshotReady, setSnapshotReady] = useState(false);
  const handleSnapshotReady = useCallback(() => setSnapshotReady(true), []);
  const hasSnapshot = Boolean(snapshot);

  useEffect(() => {
    setSnapshotReady(!hasSnapshot);
  }, [hasSnapshot, snapshot?.id]);
  const scrollMetrics = useMemo(() => getScrollScreenWidthMetrics(scroll), [scroll]);
  const screenWidthBuckets = useMemo(
    () => getScreenWidthBuckets(scrollMetrics, { pageSize: 'weightedAverage' }),
    [scrollMetrics],
  );
  const { viewport, setSelectedScreenWidth } = useSelectedScreenWidthBucket(screenWidthBuckets);
  const selectedBuckets = useMemo(
    () => getSelectedScrollBuckets(scroll, viewport),
    [scroll, viewport],
  );
  const totalSessions = viewport?.count ?? 0;
  const pageW = viewport?.pageW ?? scroll?.pageW ?? 0;
  const pageH = viewport?.pageH ?? scroll?.pageH ?? 0;
  const viewportW = viewport?.width ?? scroll?.viewportW ?? 0;
  const viewportH = viewport?.viewportH ?? scroll?.viewportH ?? 0;
  const baseWidth = Math.max(pageW, 1);
  const baseHeight = Math.max(pageH, 640);
  const renderWidth = viewport?.width ?? snapshot?.viewportW ?? viewportW ?? baseWidth;
  const renderHeight = baseHeight;
  const hasMeasuredWidth = Boolean(viewport?.width || snapshot?.viewportW || viewportW || pageW);
  const fit = useCanvasFit(renderWidth, renderHeight);
  const canvasWidth = hasMeasuredWidth ? `${fit.width}px` : '100%';
  const canvasHeight = hasMeasuredWidth ? `${fit.height}px` : undefined;
  const shouldRenderSnapshot = renderWidth > 0 && hasSnapshot;
  const showOverlay = !shouldRenderSnapshot || snapshotReady;
  const hasScrollData = Boolean(
    viewport && selectedBuckets.length > 0 && totalSessions > 0 && pageW && pageH && viewportW,
  );
  const showLoading = isLoading;
  const bucketDescription = viewport
    ? viewport.minViewportW === viewport.maxViewportW
      ? `Recorded at ${viewport.minViewportW}px wide`
      : `Grouped recorded widths from ${viewport.minViewportW}px to ${viewport.maxViewportW}px`
    : undefined;

  type Band = { fromPct: number; toPct: number; reached: number; ratio: number };
  const bands: Band[] = [];
  const sessionsByDepth = new Map(selectedBuckets.map(bucket => [bucket.depth, bucket.sessions]));
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
          <Text color="muted" className={styles.summaryStat} title={bucketDescription}>
            {hasScrollData
              ? `${formatLongNumber(totalSessions)} sessions - page ${pageW}x${pageH}${viewportH ? ` - viewport ${viewportW}x${viewportH}` : ''}`
              : 'No scroll data for this page yet.'}
          </Text>
          <ScreenWidthSelect
            buckets={screenWidthBuckets}
            value={viewport?.width ?? null}
            onChange={setSelectedScreenWidth}
          />
        </Row>
      )}

      <div ref={fit.wrapperRef} className={styles.canvasWrapper}>
        <div
          className={styles.canvas}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            aspectRatio: `${Math.max(1, renderWidth)} / ${Math.max(1, renderHeight)}`,
          }}
        >
          {showLoading ? (
            <CanvasLoading />
          ) : !hasScrollData ? (
            <EmptyState message="No scroll data for this page yet." />
          ) : (
            <div
              className={styles.canvasSurface}
              style={{
                width: Math.max(1, renderWidth),
                height: Math.max(1, renderHeight),
                transform: `scale(${fit.scale})`,
              }}
            >
              {shouldRenderSnapshot && !snapshotReady && <CanvasLoading />}
              {shouldRenderSnapshot && snapshot && (
                <SnapshotPreview snapshot={snapshot} onReady={handleSnapshotReady} />
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
                        <span
                          className={styles.scrollBandLabel}
                          // Counter-scale the label by the inverse of the canvas
                          // scale so its on-screen size stays constant while the
                          // bands resize with the rest of the overlay.
                          style={{ transform: `scale(${1 / fit.scale})` }}
                        >
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
    </Column>
  );
}

function SnapshotPreview({
  snapshot,
  onReady,
}: {
  snapshot: HeatmapSnapshot;
  onReady: () => void;
}) {
  return <IframeSnapshot snapshot={snapshot} onReady={onReady} />;
}

function IframeSnapshot({
  snapshot,
  onReady,
}: {
  snapshot: HeatmapSnapshot;
  onReady: () => void;
}) {
  const [available, setAvailable] = useState(true);
  const iframeUrl = snapshot.url;

  useEffect(() => {
    setAvailable(true);

    const readyTimer = window.setTimeout(() => onReady(), 1500);

    return () => window.clearTimeout(readyTimer);
  }, [onReady, snapshot.id]);

  const handleLoad = useCallback(() => onReady(), [onReady]);
  const handleError = useCallback(() => {
    setAvailable(false);
    onReady();
  }, [onReady]);

  if (!available) {
    return null;
  }

  return (
    <div className={styles.snapshot}>
      <iframe
        className={`${styles.snapshotIframe} rr-block`}
        src={iframeUrl}
        title={iframeUrl}
        tabIndex={-1}
        loading="lazy"
        scrolling="no"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
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
