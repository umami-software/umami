'use client';
import Link from 'next/link';
import { useTheme } from '@umami/react-zen';
import { useEffect, useMemo, useRef } from 'react';
import ChartJS from 'chart.js/auto';
import { Favicon } from '@/components/common/Favicon';
import { useNavigation } from '@/components/hooks';
import { useWebsiteSummaryQuery } from '@/components/hooks/queries/useWebsiteSummaryQuery';
import { getThemeColors } from '@/lib/colors';
import { formatLongNumber } from '@/lib/format';

function Sparkline({ data, theme }: { data: { x: string; y: number }[]; theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chartRef.current?.destroy();

    const values = data?.map(d => ({ x: d.x, y: d.y })) ?? [];
    const lineColor = (colors as any)?.chart?.visitors?.borderColor ?? '#6366f1';

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            data: values,
            parsing: { xAxisKey: 'x', yAxisKey: 'y' },
            borderColor: lineColor,
            backgroundColor: lineColor + '22',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.35,
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
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, colors]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={64}
      style={{ display: 'block', width: '100%', height: '64px' }}
    />
  );
}

export function WebsiteSummaryCard({
  website,
}: {
  website: { id: string; name: string; domain: string };
}) {
  const { theme } = useTheme();
  const { renderUrl } = useNavigation();
  const { data, isLoading } = useWebsiteSummaryQuery(website.id);

  const visitors = data?.stats?.visitors ?? 0;
  const pageviews = data?.pageviews ?? [];

  return (
    <Link
      href={renderUrl(`/websites/${website.id}`, false)}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--base-100)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-color)')
        }
        onMouseLeave={e =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)')
        }
      >
        {/* Header */}
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Favicon domain={website.domain} />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {website.name}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-500)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {website.domain}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div style={{ padding: '0 0 4px', minHeight: '68px' }}>
          {isLoading ? (
            <div
              style={{
                height: '64px',
                background: 'var(--base-200)',
                opacity: 0.5,
              }}
            />
          ) : (
            <Sparkline data={pageviews} theme={theme} />
          )}
        </div>

        {/* Stats footer */}
        <div style={{ padding: '8px 16px 14px', fontSize: '13px' }}>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>
            {isLoading ? '--' : formatLongNumber(visitors)}
          </span>
          <span style={{ color: 'var(--text-500)', marginLeft: '5px' }}>visitors · last 24h</span>
        </div>
      </div>
    </Link>
  );
}
