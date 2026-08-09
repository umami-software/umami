import { Column, Row, StatusLight, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { formatLongCurrency } from '@/lib/format';
import type { ARRMetrics } from '@/queries/sql/billing/getARR';
import { ARR_SERIES, computeYoYGrowth, YOY_GROWTH_COLOR } from './arr';

export interface ARRSummaryStatsProps {
  data: ARRMetrics[];
  currency?: string;
}

export function ARRSummaryStats({ data, currency = 'USD' }: ARRSummaryStatsProps) {
  const latest = data[data.length - 1];
  const growth = useMemo(() => computeYoYGrowth(data), [data]);
  const latestGrowth = growth[growth.length - 1];

  if (!latest) {
    return null;
  }

  return (
    <Column gap="4">
      <Column gap="1">
        <Text color="muted">ARR (Growth Accounting)</Text>
        <Text size="4xl" weight="bold">
          {formatLongCurrency(latest.totalSales, currency)}
        </Text>
      </Column>
      <Row wrap="wrap" gap="6" gapY="3">
        {ARR_SERIES.map(({ key, label, color }) => (
          <StatItem
            key={key}
            color={color}
            label={label}
            value={formatLongCurrency(latest[key], currency)}
          />
        ))}
        {latestGrowth != null && (
          <StatItem
            color={YOY_GROWTH_COLOR}
            label="YoY Growth"
            value={`${latestGrowth.toFixed(1)}%`}
          />
        )}
      </Row>
    </Column>
  );
}

function StatItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <StatusLight color={color}>
      <Row gap="2" alignItems="baseline">
        <Text size="sm" color="muted">
          {label}
        </Text>
        <Text weight="bold">{value}</Text>
      </Row>
    </StatusLight>
  );
}
