'use client';
import { Row, Column, Text } from '@umami/react-zen';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface RecommendationPerformanceMetricsProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export function RecommendationPerformanceMetrics({
  websiteId,
  startDate,
  endDate,
  timezone = 'utc',
}: RecommendationPerformanceMetricsProps) {
  const { formatCurrency, formatNumber } = useFormat();

  const { data, isLoading, error } = useApi('/api/first8marketing/recommendations/performance', {
    method: 'POST',
    body: {
      websiteId,
      parameters: { startDate, endDate, timezone },
      filters: {},
    },
  });

  if (isLoading) return <LoadingPanel />;
  if (error) return <ErrorMessage message={error.message} />;

  const { by_strategy = [], by_model = [], by_type = [], summary = {} } = data || {};

  return (
    <Column gap="4">
      <Text size="6" weight="bold">Recommendation Performance Analytics</Text>

      {/* Summary Metrics */}
      <Row gap="4">
        <MetricCard
          label="Total Recommendations"
          value={formatNumber(summary.total_recommendations || 0)}
        />
        <MetricCard
          label="Total Clicks"
          value={formatNumber(summary.total_clicks || 0)}
        />
        <MetricCard
          label="Total Conversions"
          value={formatNumber(summary.total_conversions || 0)}
        />
        <MetricCard
          label="Overall CTR"
          value={`${(summary.overall_ctr || 0).toFixed(2)}%`}
        />
        <MetricCard
          label="Overall Conv. Rate"
          value={`${(summary.overall_conversion_rate || 0).toFixed(2)}%`}
        />
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(summary.total_revenue || 0)}
        />
      </Row>

      {/* Performance by Strategy */}
      <Column gap="2">
        <Text size="4" weight="bold">Performance by Strategy</Text>
        <MetricsTable
          data={by_strategy.map((s: any) => ({
            strategy: s.strategy,
            total_shown: s.total_shown,
            total_clicked: s.total_clicked,
            total_converted: s.total_converted,
            ctr: parseFloat(s.ctr || 0),
            conversion_rate: parseFloat(s.conversion_rate || 0),
            total_revenue: parseFloat(s.total_revenue || 0),
            avg_revenue_per_recommendation: parseFloat(s.avg_revenue_per_recommendation || 0),
          }))}
          columns={[
            { name: 'strategy', label: 'Strategy', type: 'string' },
            { name: 'total_shown', label: 'Shown', type: 'number', format: formatNumber },
            { name: 'total_clicked', label: 'Clicked', type: 'number', format: formatNumber },
            { name: 'total_converted', label: 'Converted', type: 'number', format: formatNumber },
            { name: 'ctr', label: 'CTR', type: 'number', format: (v: number) => `${v.toFixed(2)}%` },
            { name: 'conversion_rate', label: 'Conv. Rate', type: 'number', format: (v: number) => `${v.toFixed(2)}%` },
            { name: 'total_revenue', label: 'Revenue', type: 'number', format: formatCurrency },
            { name: 'avg_revenue_per_recommendation', label: 'Avg Rev/Rec', type: 'number', format: formatCurrency },
          ]}
        />
      </Column>

      {/* Performance by Model Version */}
      <Column gap="2">
        <Text size="4" weight="bold">Performance by Model Version (Top 20)</Text>
        <MetricsTable
          data={by_model.map((m: any) => ({
            model_version: m.model_version,
            strategy: m.strategy,
            total_shown: m.total_shown,
            total_clicked: m.total_clicked,
            total_converted: m.total_converted,
            ctr: parseFloat(m.ctr || 0),
            conversion_rate: parseFloat(m.conversion_rate || 0),
            total_revenue: parseFloat(m.total_revenue || 0),
          }))}
          columns={[
            { name: 'model_version', label: 'Model Version', type: 'string' },
            { name: 'strategy', label: 'Strategy', type: 'string' },
            { name: 'total_shown', label: 'Shown', type: 'number', format: formatNumber },
            { name: 'total_clicked', label: 'Clicked', type: 'number', format: formatNumber },
            { name: 'total_converted', label: 'Converted', type: 'number', format: formatNumber },
            { name: 'ctr', label: 'CTR', type: 'number', format: (v: number) => `${v.toFixed(2)}%` },
            { name: 'conversion_rate', label: 'Conv. Rate', type: 'number', format: (v: number) => `${v.toFixed(2)}%` },
            { name: 'total_revenue', label: 'Revenue', type: 'number', format: formatCurrency },
          ]}
        />
      </Column>

      {/* Performance by Recommendation Type */}
      <Column gap="2">
        <Text size="4" weight="bold">Performance by Recommendation Type</Text>
        <MetricsTable
          data={by_type.map((t: any) => ({
            recommendation_type: t.recommendation_type,
            total_shown: t.total_shown,
            total_clicked: t.total_clicked,
            total_converted: t.total_converted,
            ctr: parseFloat(t.ctr || 0),
            conversion_rate: parseFloat(t.conversion_rate || 0),
            total_revenue: parseFloat(t.total_revenue || 0),
          }))}
          columns={[
            { name: 'recommendation_type', label: 'Type', type: 'string' },
            { name: 'total_shown', label: 'Shown', type: 'number', format: formatNumber },
            { name: 'total_clicked', label: 'Clicked', type: 'number', format: formatNumber },
            { name: 'total_converted', label: 'Converted', type: 'number', format: formatNumber },
            { name: 'ctr', label: 'CTR', type: 'number', format: (v: number) => `${v.toFixed(2)}%` },
            { name: 'conversion_rate', label: 'Conv. Rate', type: 'number', format: (v: number) => `${v.toFixed(2)}%` },
            { name: 'total_revenue', label: 'Revenue', type: 'number', format: formatCurrency },
          ]}
        />
      </Column>
    </Column>
  );
}

