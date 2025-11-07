'use client';
import { Column, Text } from '@umami/react-zen';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface CategoryConversionFunnelProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export function CategoryConversionFunnel({
  websiteId,
  startDate,
  endDate,
  timezone = 'utc',
}: CategoryConversionFunnelProps) {
  const { formatCurrency, formatNumber } = useFormat();

  const { data, isLoading, error } = useApi('/api/first8marketing/woocommerce/categories', {
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

  const { categories } = data || {};

  return (
    <Column gap="2">
      <Text size="6" weight="bold">
        Category Conversion Funnel
      </Text>
      <Text size="2" color="gray">
        Track user journey from category view to purchase
      </Text>
      <MetricsTable
        data={categories}
        columns={[
          { name: 'category_id', label: 'Category', type: 'string' },
          { name: 'category_views', label: 'Cat. Views', type: 'number', format: formatNumber },
          { name: 'product_views', label: 'Prod. Views', type: 'number', format: formatNumber },
          {
            name: 'view_to_product_rate',
            label: 'View→Prod',
            type: 'number',
            format: v => `${v.toFixed(1)}%`,
          },
          { name: 'add_to_cart', label: 'Add to Cart', type: 'number', format: formatNumber },
          {
            name: 'product_to_cart_rate',
            label: 'Prod→Cart',
            type: 'number',
            format: v => `${v.toFixed(1)}%`,
          },
          {
            name: 'checkout_started',
            label: 'Checkout',
            type: 'number',
            format: formatNumber,
          },
          {
            name: 'cart_to_checkout_rate',
            label: 'Cart→Check',
            type: 'number',
            format: v => `${v.toFixed(1)}%`,
          },
          { name: 'purchases', label: 'Purchases', type: 'number', format: formatNumber },
          {
            name: 'checkout_to_purchase_rate',
            label: 'Check→Purch',
            type: 'number',
            format: v => `${v.toFixed(1)}%`,
          },
          {
            name: 'overall_conversion_rate',
            label: 'Overall Conv.',
            type: 'number',
            format: v => `${v.toFixed(1)}%`,
          },
          { name: 'revenue', label: 'Revenue', type: 'number', format: formatCurrency },
        ]}
      />
    </Column>
  );
}

