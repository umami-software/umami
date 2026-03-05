'use client';
import { Box } from '@umami/react-zen';
import ChartJS from 'chart.js/auto';
import { useEffect, useRef } from 'react';

export interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
}

export function SparkLine({
  data,
  width = 100,
  height = 32,
  color = 'rgba(80, 130, 255, 0.9)',
  fillColor = 'rgba(80, 130, 255, 0.15)',
}: SparkLineProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chart = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvas.current || !data?.length) return;

    chart.current = new ChartJS(canvas.current, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [
          {
            data,
            borderColor: color,
            backgroundColor: fillColor,
            borderWidth: 1.5,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 0,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: { display: false },
          y: { display: false, beginAtZero: true },
        },
        elements: {
          line: { borderJoinStyle: 'round' },
        },
      },
    });

    return () => {
      chart.current?.destroy();
    };
  }, [data, color, fillColor]);

  if (!data?.length) return null;

  return (
    <Box style={{ width, height, flexShrink: 0 }}>
      <canvas ref={canvas} width={width} height={height} />
    </Box>
  );
}
