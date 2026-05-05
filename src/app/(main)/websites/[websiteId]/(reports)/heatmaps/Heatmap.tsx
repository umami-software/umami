'use client';
import { Column, Grid, Heading, Row, Text } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useResultQuery, useWebsite } from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import type { HeatmapMode, HeatmapPoint, HeatmapResult } from '@/queries/sql';
import styles from './Heatmap.module.css';

const RENDER_WIDTH = 1024;

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
  onModeChange: (mode: HeatmapMode) => void;
}

export function Heatmap({ websiteId, urlPath, onUrlPathChange, mode, onModeChange }: HeatmapProps) {
  const website = useWebsite();
  const { data, error, isLoading } = useResultQuery<HeatmapResult>('heatmap', {
    websiteId,
    urlPath: urlPath || undefined,
    mode,
  });

  const pages = data?.pages ?? [];
  const points = data?.points ?? [];
  const scroll = data?.scroll;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} height="100%">
      <Grid columns="320px 1fr" gap height="100%">
        <PageList pages={pages} selected={urlPath} onSelect={onUrlPathChange} mode={mode} />
        <Column gap>
          <ModeToggle mode={mode} onChange={onModeChange} />
          {urlPath ? (
            mode === 'scroll' ? (
              <ScrollHeatmapView
                domain={website?.domain ?? null}
                urlPath={urlPath}
                scroll={scroll}
              />
            ) : (
              <HeatmapView domain={website?.domain ?? null} urlPath={urlPath} points={points} />
            )
          ) : (
            <EmptyState />
          )}
        </Column>
      </Grid>
    </LoadingPanel>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: HeatmapMode;
  onChange: (mode: HeatmapMode) => void;
}) {
  return (
    <Row gap="2">
      <button
        type="button"
        onClick={() => onChange('click')}
        className={`${styles.toggleButton} ${mode === 'click' ? styles.toggleButtonSelected : ''}`}
      >
        Clicks
      </button>
      <button
        type="button"
        onClick={() => onChange('scroll')}
        className={`${styles.toggleButton} ${mode === 'scroll' ? styles.toggleButtonSelected : ''}`}
      >
        Scroll
      </button>
    </Row>
  );
}

function PageList({
  pages,
  selected,
  onSelect,
  mode,
}: {
  pages: HeatmapResult['pages'];
  selected: string;
  onSelect: (urlPath: string) => void;
  mode: HeatmapMode;
}) {
  return (
    <Column className={styles.pageList} gap="2">
      <Heading size="lg">Pages</Heading>
      {pages.length === 0 && <Text color="muted">No data yet</Text>}
      {pages.map(p => (
        <button
          key={p.urlPath}
          type="button"
          onClick={() => onSelect(p.urlPath)}
          className={`${styles.pageButton} ${selected === p.urlPath ? styles.pageButtonSelected : ''}`}
        >
          <Row alignItems="center" justifyContent="space-between" gap="2">
            <Text truncate>{p.urlPath}</Text>
            <Text color="muted">{formatLongNumber(mode === 'scroll' ? p.sessions : p.count)}</Text>
          </Row>
        </button>
      ))}
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
  domain,
  urlPath,
  points,
}: {
  domain: string | null;
  urlPath: string;
  points: HeatmapPoint[];
}) {
  const [showPage, setShowPage] = useState(true);

  const viewport = useMemo(() => pickViewport(points), [points]);

  const visible = useMemo(() => {
    if (!viewport) return [];
    return points.filter(p => p.viewportW === viewport.width && p.viewportH === viewport.height);
  }, [points, viewport]);

  const maxCount = useMemo(
    () => visible.reduce((m, p) => (p.count > m ? p.count : m), 1),
    [visible],
  );

  if (!viewport || visible.length === 0) {
    return <EmptyState />;
  }

  const scale = RENDER_WIDTH / viewport.width;
  const renderHeight = Math.round(viewport.height * scale);
  const iframeSrc = domain ? `https://${domain}${urlPath}` : null;

  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap>
        <Text color="muted">
          {visible.length} positions · {formatLongNumber(visible.reduce((s, p) => s + p.count, 0))}{' '}
          clicks · viewport {viewport.width}×{viewport.height}
        </Text>
        {iframeSrc && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPage(v => !v)}
          >
            {showPage ? 'Hide page' : 'Show page'}
          </button>
        )}
      </Row>
      <div className={styles.canvas} style={{ width: RENDER_WIDTH, height: renderHeight }}>
        {showPage && iframeSrc && (
          <iframe
            className={styles.iframe}
            src={iframeSrc}
            width={viewport.width}
            height={viewport.height}
            style={{ transform: `scale(${scale})` }}
            sandbox="allow-same-origin"
            referrerPolicy="no-referrer"
          />
        )}
        <div className={styles.overlay}>
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
      </div>
    </Column>
  );
}

function ScrollHeatmapView({
  domain,
  urlPath,
  scroll,
}: {
  domain: string | null;
  urlPath: string;
  scroll: HeatmapResult['scroll'] | undefined;
}) {
  const [showPage, setShowPage] = useState(true);

  if (!scroll || scroll.totalSessions === 0 || !scroll.pageH || !scroll.viewportW) {
    return <EmptyState message="No scroll data for this page yet." />;
  }

  const { buckets, totalSessions, pageH, viewportW, viewportH } = scroll;
  const scale = RENDER_WIDTH / viewportW;
  const renderHeight = Math.round(pageH * scale);
  const iframeSrc = domain ? `https://${domain}${urlPath}` : null;

  // Cumulative reach: % of sessions that scrolled at least to depth D.
  const sortedBuckets = [...buckets].sort((a, b) => a.depth - b.depth);
  let remaining = totalSessions;
  const cumulative = sortedBuckets.map(b => {
    const reached = remaining;
    remaining -= b.sessions;
    return { depth: b.depth, reached, ratio: reached / totalSessions };
  });

  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap>
        <Text color="muted">
          {formatLongNumber(totalSessions)} sessions · page {viewportW}×{pageH}
          {viewportH ? ` · viewport ${viewportH}` : ''}
        </Text>
        {iframeSrc && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPage(v => !v)}
          >
            {showPage ? 'Hide page' : 'Show page'}
          </button>
        )}
      </Row>
      <div className={styles.canvas} style={{ width: RENDER_WIDTH, height: renderHeight }}>
        {showPage && iframeSrc && (
          <iframe
            className={styles.iframe}
            src={iframeSrc}
            width={viewportW}
            height={pageH}
            style={{ transform: `scale(${scale})` }}
            sandbox="allow-same-origin"
            referrerPolicy="no-referrer"
          />
        )}
        <div className={styles.overlay}>
          {cumulative.map((b, i) => {
            const top = Math.round((b.depth / 100) * renderHeight);
            const next = cumulative[i + 1];
            const bottom = next ? Math.round((next.depth / 100) * renderHeight) : renderHeight;
            const height = Math.max(0, bottom - top);
            const intensity = b.ratio;
            const hue = Math.round(60 - intensity * 60); // 60=yellow → 0=red
            return (
              <div
                key={b.depth}
                className={styles.scrollBand}
                style={{
                  top,
                  height,
                  background: `hsla(${hue}, 90%, 50%, ${0.15 + intensity * 0.5})`,
                }}
                title={`${b.depth}% — ${formatLongNumber(b.reached)} sessions (${Math.round(intensity * 100)}%)`}
              >
                <span className={styles.scrollBandLabel}>
                  {b.depth}% · {Math.round(intensity * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Column>
  );
}

function EmptyState({ message }: { message?: string } = {}) {
  return (
    <Column alignItems="center" justifyContent="center" height="100%" gap>
      <Heading size="lg">{message ? 'No data' : 'Select a page'}</Heading>
      <Text color="muted">{message ?? 'Choose a page from the list to view its heatmap.'}</Text>
    </Column>
  );
}
