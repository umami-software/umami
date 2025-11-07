'use client';
import { Column, Text } from '@umami/react-zen';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface ProductPerformanceTableProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export function ProductPerformanceTable({
  websiteId,
  startDate,
  endDate,
  timezone = 'utc',
}: ProductPerformanceTableProps) {
  const { formatCurrency, formatNumber } = useFormat();

  const { data, isLoading, error } = useApi('/api/first8marketing/woocommerce/products', {
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

  const { products } = data || {};

  return (
    <Column gap="2">
      <Text size="6" weight="bold">
        Product Performance Analytics
      </Text>
      <MetricsTable
        data={products}
        columns={[
          { name: 'product_id', label: 'Product ID', type: 'string' },
          { name: 'views', label: 'Views', type: 'number', format: formatNumber },
          { name: 'add_to_cart', label: 'Add to Cart', type: 'number', format: formatNumber },
          {
            name: 'add_to_cart_rate',
            label: 'Cart Rate',
            type: 'number',
            format: v => `${v.toFixed(1)}%`,
          },
          { name: 'purchases', label: 'Purchases', type: 'number', format: formatNumber },
          {
            name: 'conversion_rate',
            label: 'Conv. Rate',
            type: 'number',
            format: v => `${v.toFixed(1)}%`,
          },
          { name: 'revenue', label: 'Revenue', type: 'number', format: formatCurrency },
          {
            name: 'revenue_per_view',
            label: 'Revenue/View',
            type: 'number',
            format: formatCurrency,
          },
        ]}
      />
    </Column>
  );
}

