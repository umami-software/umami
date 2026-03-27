'use client';
import Link from 'next/link';
import { useTheme } from '@umami/react-zen';
import { useMemo } from 'react';
import ChartJS from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import { Favicon } from '@/components/common/Favicon';
import { useNavigation } from '@/components/hooks';
import { useWebsiteSummaryQuery } from '@/components/hooks/queries/useWebsiteSummaryQuery';
import { getThemeColors } from '@/lib/colors';
import { formatLongNumber } from '@/lib/format';

function Sparkline({
  data,
  theme,
}: {
  data: { x: string; y: number }[];
  theme: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  useEffect(() => {
    if (!canvasRef.current || !data?.length) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const values = data.map(d => d.y);

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.x),
        datasets: [
          {
            data: values,
            borderColor: colors.chart.visitors?.borderColor ?? '#3b82f6',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: { display: false },
          y: { display: false },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, colors]);

  return <canvas ref={canvasRef} width={220} height={60} style={{ display: 'block' }} />;
}

export function WebsiteSummaryCard({ website }: { website: { id: string; name: string; domain: string } }) {
  const { theme } = useTheme();
  const { renderUrl } = useNavigation();
  const { data, isLoading } = useWebsiteSummaryQuery(website.id);

  const visitors = data?.stats?.visitors ?? 0;
  const pageviewData = data?.pageviews ?? [];

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
          padding: '16px',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background-color 0.15s',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-color)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Favicon domain={website.domain} />
          <div style={{ overflow: 'hidden' }}>
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

        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '60px', backgroundColor: 'var(--base-200)', borderRadius: '4px' }} />
          </div>
        ) : (
          <div style={{ overflow: 'hidden', borderRadius: '4px' }}>
            <Sparkline data={pageviewData} theme={theme} />
          </div>
        )}

        <div style={{ fontSize: '13px' }}>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>
            {isLoading ? '--' : formatLongNumber(visitors)}
          </span>
          <span style={{ color: 'var(--text-500)', marginLeft: '4px' }}>
            visitors in last 24h
          </span>
        </div>
      </div>
    </Link>
  );
}
