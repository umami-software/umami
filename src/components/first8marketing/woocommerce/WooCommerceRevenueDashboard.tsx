'use client';
import { Row, Column, Text } from '@umami/react-zen';
import { MetricCard } from '@/components/metrics/MetricCard';
import { BarChart } from '@/components/charts/BarChart';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface WooCommerceRevenueDashboardProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  unit?: string;
  timezone?: string;
}

export function WooCommerceRevenueDashboard({
  websiteId,
  startDate,
  endDate,
  unit = 'day',
  timezone = 'utc',
}: WooCommerceRevenueDashboardProps) {
  const { formatCurrency, formatNumber } = useFormat();

  const { data, isLoading, error } = useApi('/api/first8marketing/woocommerce/revenue', {
    method: 'POST',
    body: {
      websiteId,
      parameters: {
        startDate,
        endDate,
        unit,
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

  const { chart, products, categories, total } = data || {};

  return (
    <Column gap="4">
      {/* Summary Metrics */}
      <Row gap="4">
        <MetricCard
          label="Total Revenue"
          value={total?.sum || 0}
          formatValue={formatCurrency}
          showLabel
        />
        <MetricCard
          label="Total Orders"
          value={total?.count || 0}
          formatValue={formatNumber}
          showLabel
        />
        <MetricCard
          label="Average Order Value"
          value={total?.average || 0}
          formatValue={formatCurrency}
          showLabel
        />
        <MetricCard
          label="Cart Abandonment Rate"
          value={total?.cart_abandonment_rate || 0}
          formatValue={v => `${v.toFixed(1)}%`}
          showLabel
          reverseColors
        />
      </Row>

      {/* Revenue Chart */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Revenue Over Time
        </Text>
        <BarChart data={chart} unit={unit} />
      </Column>

      {/* Top Products */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Top Products by Revenue
        </Text>
        <MetricsTable
          data={products}
          columns={[
            { name: 'product_id', label: 'Product ID', type: 'string' },
            { name: 'revenue', label: 'Revenue', type: 'number', format: formatCurrency },
            { name: 'orders', label: 'Orders', type: 'number', format: formatNumber },
          ]}
        />
      </Column>

      {/* Top Categories */}
      <Column gap="2">
        <Text size="6" weight="bold">
          Top Categories by Revenue
        </Text>
        <MetricsTable
          data={categories}
          columns={[
            { name: 'category_id', label: 'Category ID', type: 'string' },
            { name: 'revenue', label: 'Revenue', type: 'number', format: formatCurrency },
            { name: 'orders', label: 'Orders', type: 'number', format: formatNumber },
          ]}
        />
      </Column>
    </Column>
  );
}

