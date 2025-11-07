'use client';
import { Row, Column, Text } from '@umami/react-zen';
import { MetricCard } from '@/components/metrics/MetricCard';
import { PieChart } from '@/components/charts/PieChart';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface EngagementMetricsDashboardProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export function EngagementMetricsDashboard({
  websiteId,
  startDate,
  endDate,
  timezone = 'utc',
}: EngagementMetricsDashboardProps) {
  const { formatNumber } = useFormat();

  const { data, isLoading, error } = useApi('/api/first8marketing/engagement/metrics', {
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
  });

  if (isLoading) {
    return <LoadingPanel />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  const {
    scroll_depth_distribution,
    time_on_page_distribution,
    click_count_distribution,
    form_interactions_summary,
    averages,
  } = data || {};

  return (
    <Column gap="4">
      {/* Summary Metrics */}
      <Row gap="4">
        <MetricCard
          label="Avg Scroll Depth"
          value={averages?.avg_scroll_depth || 0}
          formatValue={v => `${v.toFixed(1)}%`}
          showLabel
        />
        <MetricCard
          label="Avg Time on Page"
          value={averages?.avg_time_on_page || 0}
          formatValue={v => `${v.toFixed(0)}s`}
          showLabel
        />
        <MetricCard
          label="Avg Click Count"
          value={averages?.avg_click_count || 0}
          formatValue={v => v.toFixed(1)}
          showLabel
        />
        <MetricCard
          label="Form Interactions"
          value={form_interactions_summary?.total_interactions || 0}
          formatValue={formatNumber}
          showLabel
        />
      </Row>

      {/* Scroll Depth Distribution */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Scroll Depth Distribution
        </Text>
        <PieChart
          data={scroll_depth_distribution?.map(item => ({
            x: item.range,
            y: item.count,
          }))}
        />
      </Column>

      {/* Time on Page Distribution */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Time on Page Distribution
        </Text>
        <PieChart
          data={time_on_page_distribution?.map(item => ({
            x: item.range,
            y: item.count,
          }))}
        />
      </Column>

      {/* Click Count Distribution */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Click Count Distribution
        </Text>
        <PieChart
          data={click_count_distribution?.map(item => ({
            x: item.range,
            y: item.count,
          }))}
        />
      </Column>

      {/* Form Interactions Summary */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Form Interactions Summary
        </Text>
        <Row gap="4">
          <MetricCard
            label="Total Interactions"
            value={form_interactions_summary?.total_interactions || 0}
            formatValue={formatNumber}
            showLabel
          />
          <MetricCard
            label="Unique Sessions"
            value={form_interactions_summary?.unique_sessions || 0}
            formatValue={formatNumber}
            showLabel
          />
        </Row>
      </Column>
    </Column>
  );
}

