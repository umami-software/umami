'use client';
import { Row, Column, Text } from '@umami/react-zen';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface UserProfileDashboardProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export function UserProfileDashboard({
  websiteId,
  startDate,
  endDate,
  timezone = 'utc',
}: UserProfileDashboardProps) {
  const { formatCurrency, formatNumber } = useFormat();

  const { data, isLoading, error } = useApi('/api/first8marketing/recommendations/user-profiles', {
    method: 'POST',
    body: {
      websiteId,
      parameters: { startDate, endDate, timezone },
      filters: {},
    },
  });

  if (isLoading) return <LoadingPanel />;
  if (error) return <ErrorMessage message={error.message} />;

  const profiles = data || [];

  // Calculate summary metrics
  const totalUsers = profiles.length;
  const totalRevenue = profiles.reduce((sum: number, p: any) => sum + parseFloat(p.total_revenue || 0), 0);
  const avgSessionsPerUser = totalUsers > 0
    ? profiles.reduce((sum: number, p: any) => sum + (p.session_count || 0), 0) / totalUsers
    : 0;
  const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

  // Lifecycle distribution
  const lifecycleDistribution = profiles.reduce((acc: any, p: any) => {
    const stage = p.lifecycle_stage || 'unknown';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  // Funnel distribution
  const funnelDistribution = profiles.reduce((acc: any, p: any) => {
    const position = p.funnel_position || 'unknown';
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {});

  return (
    <Column gap="4">
      <Text size="6" weight="bold">User Profile Analytics</Text>

      {/* Summary Metrics */}
      <Row gap="4">
        <MetricCard
          label="Total Users"
          value={formatNumber(totalUsers)}
        />
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
        />
        <MetricCard
          label="Avg Sessions/User"
          value={avgSessionsPerUser.toFixed(1)}
        />
        <MetricCard
          label="Avg Revenue/User"
          value={formatCurrency(avgRevenuePerUser)}
        />
      </Row>

      {/* Lifecycle Distribution */}
      <Column gap="2">
        <Text size="4" weight="bold">Lifecycle Stage Distribution</Text>
        <MetricsTable
          data={Object.entries(lifecycleDistribution).map(([stage, count]) => ({
            lifecycle_stage: stage,
            user_count: count,
            percentage: ((count as number / totalUsers) * 100).toFixed(1),
          }))}
          columns={[
            { name: 'lifecycle_stage', label: 'Lifecycle Stage', type: 'string' },
            { name: 'user_count', label: 'Users', type: 'number', format: formatNumber },
            { name: 'percentage', label: 'Percentage', type: 'number', format: (v: number) => `${v}%` },
          ]}
        />
      </Column>

      {/* Funnel Position Distribution */}
      <Column gap="2">
        <Text size="4" weight="bold">Funnel Position Distribution</Text>
        <MetricsTable
          data={Object.entries(funnelDistribution).map(([position, count]) => ({
            funnel_position: position,
            user_count: count,
            percentage: ((count as number / totalUsers) * 100).toFixed(1),
          }))}
          columns={[
            { name: 'funnel_position', label: 'Funnel Position', type: 'string' },
            { name: 'user_count', label: 'Users', type: 'number', format: formatNumber },
            { name: 'percentage', label: 'Percentage', type: 'number', format: (v: number) => `${v}%` },
          ]}
        />
      </Column>

      {/* Top Users by Revenue */}
      <Column gap="2">
        <Text size="4" weight="bold">Top Users by Revenue (Top 20)</Text>
        <MetricsTable
          data={profiles.slice(0, 20).map((p: any) => ({
            user_id: p.user_id,
            lifecycle_stage: p.lifecycle_stage,
            funnel_position: p.funnel_position,
            sessions: p.session_count,
            purchases: p.total_purchases,
            revenue: parseFloat(p.total_revenue || 0),
            avg_session_duration: p.avg_session_duration,
            price_sensitivity: p.price_sensitivity,
            device_preference: p.device_preference,
          }))}
          columns={[
            { name: 'user_id', label: 'User ID', type: 'string' },
            { name: 'lifecycle_stage', label: 'Lifecycle', type: 'string' },
            { name: 'funnel_position', label: 'Funnel', type: 'string' },
            { name: 'sessions', label: 'Sessions', type: 'number', format: formatNumber },
            { name: 'purchases', label: 'Purchases', type: 'number', format: formatNumber },
            { name: 'revenue', label: 'Revenue', type: 'number', format: formatCurrency },
            { name: 'avg_session_duration', label: 'Avg Duration (s)', type: 'number', format: formatNumber },
            { name: 'price_sensitivity', label: 'Price Sens.', type: 'string' },
            { name: 'device_preference', label: 'Device', type: 'string' },
          ]}
        />
      </Column>
    </Column>
  );
}

