'use client';
import { Column, Grid, Heading, Row, Text } from '@umami/react-zen';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useResultQuery, useWebsite } from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import type { HeatmapMode, HeatmapPoint, HeatmapResult } from '@/queries/sql';
import styles from './Heatmap.module.css';

const MAX_RENDER_WIDTH = 1024;
const IFRAME_SANDBOX = 'allow-same-origin allow-scripts allow-forms allow-popups';

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
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
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="900px">
      <Grid columns="320px 1fr" gap minHeight="900px">
        <PageList pages={pages} selected={urlPath} onSelect={onUrlPathChange} mode={mode} />
        <Column gap>
          <ModeToggle mode={mode} onChange={onModeChange} />
          {urlPath ? (
            mode === 'scroll' ? (
              <ScrollHeatmapView
                websiteId={websiteId}
                domain={website?.domain ?? null}
                urlPath={urlPath}
                scroll={scroll}
              />
            ) : (
              <HeatmapView
                websiteId={websiteId}
                domain={website?.domain ?? null}
                urlPath={urlPath}
                points={points}
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

function buildIframeSrc(
  websiteId: string | null,
  domain: string | null,
  urlPath: string,
): string | null {
  // Self-record: data was captured from this very umami instance, so iframe the
  // current origin instead of the website's stored domain (which often points to prod).
  if (typeof window !== 'undefined' && websiteId && websiteId === process.env.selfRecord) {
    return `${window.location.origin}${urlPath}`;
  }
  if (!domain) return null;
  if (/^https?:\/\//i.test(domain)) return `${domain}${urlPath}`;
  const isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(domain);
  const protocol = isLocal
    ? typeof window !== 'undefined'
      ? window.location.protocol
      : 'http:'
    : 'https:';
  return `${protocol}//${domain}${urlPath}`;
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
  websiteId,
  domain,
  urlPath,
  points,
}: {
  websiteId: string;
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

  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>();

  if (!viewport || visible.length === 0) {
    return <EmptyState />;
  }

  const renderWidth = containerWidth > 0 ? Math.min(containerWidth, MAX_RENDER_WIDTH) : 0;
  const scale = renderWidth ? renderWidth / viewport.width : 0;
  const renderHeight = Math.round(viewport.height * scale);
  const iframeSrc = buildIframeSrc(websiteId, domain, urlPath);

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
      <div ref={containerRef} className={styles.canvasWrapper}>
        <div
          className={styles.canvas}
          style={{ width: renderWidth || '100%', height: renderHeight || 0 }}
        >
          {renderWidth > 0 && showPage && iframeSrc && (
            <iframe
              className={styles.iframe}
              src={iframeSrc}
              width={viewport.width}
              height={viewport.height}
              style={{ transform: `scale(${scale})` }}
              sandbox={IFRAME_SANDBOX}
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
      </div>
    </Column>
  );
}

function ScrollHeatmapView({
  websiteId,
  domain,
  urlPath,
  scroll,
}: {
  websiteId: string;
  domain: string | null;
  urlPath: string;
  scroll: HeatmapResult['scroll'] | undefined;
}) {
  const [showPage, setShowPage] = useState(true);

  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>();

  if (!scroll || scroll.totalSessions === 0 || !scroll.pageH || !scroll.viewportW) {
    return <EmptyState message="No scroll data for this page yet." />;
  }

  const { buckets, totalSessions, pageH, viewportW, viewportH } = scroll;
  const renderWidth = containerWidth > 0 ? Math.min(containerWidth, MAX_RENDER_WIDTH) : 0;
  const scale = renderWidth ? renderWidth / viewportW : 0;
  const renderHeight = Math.round(pageH * scale);
  const iframeSrc = buildIframeSrc(websiteId, domain, urlPath);

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
      <div ref={containerRef} className={styles.canvasWrapper}>
        <div
          className={styles.canvas}
          style={{ width: renderWidth || '100%', height: renderHeight || 0 }}
        >
          {renderWidth > 0 && showPage && iframeSrc && (
            <iframe
              className={styles.iframe}
              src={iframeSrc}
              width={viewportW}
              height={pageH}
              style={{ transform: `scale(${scale})` }}
              sandbox={IFRAME_SANDBOX}
            />
          )}
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
