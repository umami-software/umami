'use client';
import { Row, Column, Text } from '@umami/react-zen';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface CheckoutAbandonmentTrackerProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export function CheckoutAbandonmentTracker({
  websiteId,
  startDate,
  endDate,
  timezone = 'utc',
}: CheckoutAbandonmentTrackerProps) {
  const { formatCurrency, formatNumber } = useFormat();

  const { data, isLoading, error } = useApi(
    '/api/first8marketing/woocommerce/checkout-abandonment',
    {
      method: 'POST',
      body: {
        websiteId,
        parameters: {
          startDate,
          endDate,
          timezone,
        },
        filters: {},
      },
    },
  );

  if (isLoading) {
    return <LoadingPanel />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  const { funnel_steps, abandonment_summary, abandonment_by_step } = data || {};

  return (
    <Column gap="4">
      {/* Summary Metrics */}
      <Row gap="4">
        <MetricCard
          label="Checkouts Started"
          value={abandonment_summary?.total_checkouts_started || 0}
          formatValue={formatNumber}
          showLabel
        />
        <MetricCard
          label="Completed"
          value={abandonment_summary?.total_completed || 0}
          formatValue={formatNumber}
          showLabel
        />
        <MetricCard
          label="Abandoned"
          value={abandonment_summary?.total_abandoned || 0}
          formatValue={formatNumber}
          showLabel
        />
        <MetricCard
          label="Abandonment Rate"
          value={abandonment_summary?.abandonment_rate || 0}
          formatValue={v => `${v.toFixed(1)}%`}
          showLabel
          reverseColors
        />
        <MetricCard
          label="Potential Revenue Lost"
          value={abandonment_summary?.potential_revenue_lost || 0}
          formatValue={formatCurrency}
          showLabel
          reverseColors
        />
      </Row>

      {/* Funnel Steps */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Checkout Funnel Steps
        </Text>
        <MetricsTable
          data={funnel_steps}
          columns={[
            { name: 'step', label: 'Step', type: 'number', format: formatNumber },
            { name: 'step_name', label: 'Step Name', type: 'string' },
            { name: 'sessions', label: 'Sessions', type: 'number', format: formatNumber },
            { name: 'drop_off', label: 'Drop Off', type: 'number', format: formatNumber },
            {
              name: 'drop_off_rate',
              label: 'Drop Off Rate',
              type: 'number',
              format: v => `${v.toFixed(1)}%`,
            },
          ]}
        />
      </Column>

      {/* Abandonment by Step */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Abandonment Analysis by Step
        </Text>
        <MetricsTable
          data={abandonment_by_step}
          columns={[
            { name: 'step', label: 'Step', type: 'number', format: formatNumber },
            {
              name: 'abandoned_sessions',
              label: 'Abandoned Sessions',
              type: 'number',
              format: formatNumber,
            },
            {
              name: 'avg_cart_value',
              label: 'Avg Cart Value',
              type: 'number',
              format: formatCurrency,
            },
            {
              name: 'potential_revenue',
              label: 'Potential Revenue',
              type: 'number',
              format: formatCurrency,
            },
          ]}
        />
      </Column>
    </Column>
  );
}

