'use client';

import { Column, Heading, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useHeatmapQuery } from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import type { HeatmapMode, HeatmapPoint, HeatmapResult } from '@/queries/sql';

interface BoardHeatmapProps {
  websiteId: string;
  mode?: HeatmapMode;
  path?: string;
  screen?: string;
}

function ClickOverlay({
  points,
  maxCount,
}: {
  points: HeatmapPoint[];
  maxCount: number;
}) {
  if (points.length === 0) {
    return (
      <Column alignItems="center" justifyContent="center" minHeight="360px" gap>
        <Heading size="lg">No click data</Heading>
        <Text color="muted">No click heatmap data available for this page.</Text>
      </Column>
    );
  }

  const pageW = points[0]?.pageW ?? 800;
  const pageH = points[0]?.pageH ?? 600;

  const containerW = 800;
  const containerH = 600;
  const scale = Math.min(containerW / pageW, containerH / pageH, 1);

  const scaledW = pageW * scale;
  const scaledH = pageH * scale;
  const max = maxCount > 0 ? maxCount : 1;

  return (
    <Column width="100%" height="100%" style={{ minHeight: 0, position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          width: scaledW,
          height: scaledH,
          margin: '0 auto',
          border: '1px solid var(--zen-border)',
          borderRadius: '8px',
          background: 'var(--zen-surface-sunken)',
          overflow: 'hidden',
        }}
      >
        {points.map((point, index) => {
          const intensity = point.count / max;
          const size = Math.max(4, Math.min(40, 8 + intensity * 30));
          const opacity = 0.4 + intensity * 0.6;
          const left = (point.pageX / pageW) * scaledW - size / 2;
          const top = (point.pageY / pageH) * scaledH - size / 2;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left,
                top,
                width: size,
                height: size,
                background: `radial-gradient(circle, rgba(255, 60, 0, ${opacity}) 0%, rgba(255, 200, 0, ${opacity * 0.6}) 45%, rgba(255, 200, 0, 0) 80%)`,
                borderRadius: '50%',
                pointerEvents: 'none',
                transform: `translate(-50%, -50%)`,
                mixBlendMode: 'multiply',
              }}
              title={`${formatLongNumber(point.count)} clicks at (${Math.round(point.pageX)}, ${Math.round(point.pageY)})`}
            />
          );
        })}
      </div>
      <Column alignItems="center" justifyContent="center" gap="1" paddingTop="2">
        <Text size="sm" color="muted" weight="bold">Click heatmap</Text>
        <Text size="xs" color="muted">
          {formatLongNumber(points.reduce((sum, p) => sum + p.count, 0))} total clicks
        </Text>
      </Column>
    </Column>
  );
}

function ScrollBands({
  scroll,
  pageW,
  pageH,
  viewportW,
  viewportH,
}: {
  scroll: HeatmapResult['scroll'];
  pageW: number;
  pageH: number;
  viewportW: number;
  viewportH: number;
}) {
  if (!scroll || scroll.buckets.length === 0) {
    return (
      <Column alignItems="center" justifyContent="center" minHeight="360px" gap>
        <Heading size="lg">No scroll data</Heading>
        <Text color="muted">No scroll heatmap data available for this page.</Text>
      </Column>
    );
  }

  const { buckets, totalSessions } = scroll;
  const maxReached = Math.max(...buckets.map(b => b.reached), 1);

  const contentW = pageW || 800;
  const contentH = pageH || 600;

  const containerW = 800;
  const containerH = 600;
  const scale = Math.min(containerW / contentW, containerH / contentH, 1);

  const scaledW = contentW * scale;
  const scaledH = contentH * scale;

  return (
    <Column width="100%" height="100%" style={{ minHeight: 0, position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          width: scaledW,
          height: scaledH,
          margin: '0 auto',
          border: '1px solid var(--zen-border)',
          borderRadius: '8px',
          background: 'var(--zen-surface-sunken)',
          overflow: 'hidden',
        }}
      >
        {buckets.map((band, index) => {
          const intensity = band.reached / maxReached;
          const fromPct = band.fromPct;
          const toPct = band.toPct;
          const bandHeight = Math.max(0, toPct - fromPct);
          const hue = Math.round(120 * (1 - intensity));

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${fromPct}%`,
                height: `${bandHeight}%`,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: '2px 8px',
                mixBlendMode: 'multiply',
                pointerEvents: 'auto',
              }}
            >
              <div
                style={{
                  background: intensity > 0 ? `hsla(${hue}, 90%, 55%, ${0.12 + intensity * 0.45})` : 'none',
                  width: '100%',
                  height: '100%',
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.7)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  whiteSpace: 'nowrap',
                  transformOrigin: 'top right',
                  marginRight: 8,
                }}
              >
                {Math.round(toPct)}% depth - {Math.round(intensity * 100)}% reached
              </span>
            </div>
          );
        })}
      </div>
      <Column alignItems="center" justifyContent="center" gap="1" paddingTop="2">
        <Text size="sm" color="muted" weight="bold">Scroll heatmap</Text>
        <Text size="xs" color="muted">
          {formatLongNumber(totalSessions)} total sessions
        </Text>
      </Column>
    </Column>
  );
}

export function BoardHeatmap({
  websiteId,
  mode = 'click',
  path,
  screen,
}: BoardHeatmapProps) {
  const {
    data: pagesData,
    error,
    isLoading,
  } = useHeatmapQuery({
    websiteId,
    mode,
  });

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useHeatmapQuery(
    {
      websiteId,
      urlPath: path || undefined,
      mode,
    },
    {
      enabled: Boolean(path),
    },
  );

  const pages = pagesData?.pages ?? [];
  const points = detailData?.points ?? [];
  const scroll = detailData?.scroll;
  const detailLoading = Boolean(path) && (isDetailLoading || isDetailFetching);

  if (!isLoading && pages.length === 0) {
    return (
      <LoadingPanel data={pagesData} isLoading={isLoading} error={error} min>
        <Column alignItems="center" justifyContent="center" minHeight="360px" gap>
          <Heading size="lg">No pages found</Heading>
          <Text color="muted">No heatmap data available for this website.</Text>
        </Column>
      </LoadingPanel>
    );
  }

  if (!path) {
    return (
      <Column alignItems="center" justifyContent="center" minHeight="360px" gap>
        <Heading size="lg">Configure heatmap</Heading>
        <Text color="muted">
          Set a page path in the board component settings to view its heatmap.
        </Text>
      </Column>
    );
  }

  const selectedPage = pages.find(page => page.urlPath === path);
  const isScrollMode = mode === 'scroll';
  const maxCount = useMemo(() => {
    if (points.length > 0) {
      return Math.max(...points.map(p => p.count));
    }
    return 1;
  }, [points]);

  return (
    <LoadingPanel
      data={detailData}
      isLoading={detailLoading}
      error={error}
      min
    >
      {detailData && (
        <Column width="100%" height="100%" style={{ minHeight: 0, overflow: 'hidden' }}>
          <Column width="100%" flexGrow={1} style={{ minHeight: 0, overflowY: 'auto' }}>
            {isScrollMode ? (
              <ScrollBands
                scroll={scroll}
                pageW={detailData.scroll?.pageW ?? 0}
                pageH={detailData.scroll?.pageH ?? 0}
                viewportW={detailData.scroll?.viewportW ?? 0}
                viewportH={detailData.scroll?.viewportH ?? 0}
              />
            ) : (
              <ClickOverlay points={points} maxCount={maxCount} />
            )}
          </Column>
        </Column>
      )}
    </LoadingPanel>
  );
}