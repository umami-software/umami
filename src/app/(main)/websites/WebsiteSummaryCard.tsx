'use client';
import Link from 'next/link';
import { useTheme } from '@umami/react-zen';
import { useEffect, useMemo, useRef } from 'react';
import ChartJS from 'chart.js/auto';
import { Favicon } from '@/components/common/Favicon';
import { useNavigation } from '@/components/hooks';
import { useActiveVisitorsQuery } from '@/components/hooks/queries/useActiveVisitorsQuery';
import {
  type OverviewRange,
  useWebsiteSummaryQuery,
} from '@/components/hooks/queries/useWebsiteSummaryQuery';
import { getThemeColors } from '@/lib/colors';
import { formatLongNumber } from '@/lib/format';

const ACCENT = '#e85d26'; // warm orange matching the reference screenshots

function Sparkline({ data, accent }: { data: { x: string; y: number }[]; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chartRef.current?.destroy();

    const values = (data ?? []).map(d => ({ x: d.x, y: d.y }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, accent + '55');
    grad.addColorStop(1, accent + '00');

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            data: values,
            parsing: { xAxisKey: 'x', yAxisKey: 'y' },
            borderColor: accent,
            backgroundColor: grad,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: false,
        animation: { duration: 0 },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false, type: 'category' },
          y: { display: false, beginAtZero: true },
        },
        layout: { padding: 0 },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, accent]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={120}
      style={{ display: 'block', width: '100%', height: '120px' }}
    />
  );
}

const RANGE_LABEL: Record<OverviewRange, string> = {
  '24h': 'last 24h',
  '7d': 'last 7 days',
  '30d': 'last 30 days',
  '1y': 'last year',
};

export function WebsiteSummaryCard({
  website,
  range = '24h',
}: {
  website: { id: string; name: string; domain: string };
  range?: OverviewRange;
}) {
  const { theme } = useTheme();
  const { renderUrl } = useNavigation();
  const { data, isLoading } = useWebsiteSummaryQuery(website.id, range);
  const { data: activeData } = useActiveVisitorsQuery(website.id);
  const activeVisitors = activeData?.visitors ?? 0;

  const visitors = data?.stats?.visitors ?? 0;
  const pageviews = data?.pageviews ?? [];

  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? '#2d2d2d' : '#e5e7eb';
  const textMuted = isDark ? '#888' : '#9ca3af';

  return (
    <Link
      href={renderUrl(`/websites/${website.id}`, false)}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.15s, transform 0.1s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = ACCENT;
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = borderColor;
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Header: favicon + name + domain + active indicator */}
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Favicon domain={website.domain} />
          <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.3',
              }}
            >
              {website.name}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: textMuted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.3',
              }}
            >
              {website.domain}
            </div>
          </div>
          {activeVisitors > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'inline-block',
                  boxShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>
                {activeVisitors}
              </span>
            </div>
          )}
        </div>

        {/* Sparkline — edge-to-edge, no padding */}
        <div style={{ lineHeight: 0, minHeight: '120px', position: 'relative' }}>
          {isLoading ? (
            <div
              style={{
                height: '120px',
                background: isDark ? '#222' : '#f3f4f6',
                opacity: 0.6,
              }}
            />
          ) : pageviews.length === 0 ? (
            <div
              style={{
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: textMuted,
                fontSize: '12px',
              }}
            >
              No data
            </div>
          ) : (
            <Sparkline data={pageviews} accent={ACCENT} />
          )}
        </div>

        {/* Footer: visitor count */}
        <div style={{ padding: '10px 16px 14px' }}>
          <span style={{ fontWeight: 800, fontSize: '16px' }}>
            {isLoading ? '--' : formatLongNumber(visitors)}
          </span>
          <span style={{ color: textMuted, fontSize: '13px', marginLeft: '6px' }}>
            {visitors === 1 ? 'visitor' : 'visitors'} · {RANGE_LABEL[range]}
          </span>
        </div>
      </div>
    </Link>
  );
}
