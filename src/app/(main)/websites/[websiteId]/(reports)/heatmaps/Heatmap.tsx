'use client';
import { Column, Grid, Heading, Row, Text } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useResultQuery, useWebsite } from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import type { HeatmapPoint, HeatmapResult } from '@/queries/sql';
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
}

export function Heatmap({ websiteId, urlPath, onUrlPathChange }: HeatmapProps) {
  const website = useWebsite();
  const { data, error, isLoading } = useResultQuery<HeatmapResult>('heatmap', {
    websiteId,
    urlPath: urlPath || undefined,
  });

  const pages = data?.pages ?? [];
  const points = data?.points ?? [];

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} height="100%">
      <Grid columns="320px 1fr" gap height="100%">
        <PageList pages={pages} selected={urlPath} onSelect={onUrlPathChange} />
        <Column gap>
          {urlPath ? (
            <HeatmapView domain={website?.domain ?? null} urlPath={urlPath} points={points} />
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
}: {
  pages: HeatmapResult['pages'];
  selected: string;
  onSelect: (urlPath: string) => void;
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
            <Text color="muted">{formatLongNumber(p.count)}</Text>
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
      <div
        className={styles.canvas}
        style={{ width: RENDER_WIDTH, height: renderHeight }}
      >
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

function EmptyState() {
  return (
    <Column alignItems="center" justifyContent="center" height="100%" gap>
      <Heading size="lg">Select a page</Heading>
      <Text color="muted">Choose a page from the list to view its click heatmap.</Text>
    </Column>
  );
}
