import { Grid } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useCommerceChartQuery,
  useCommerceCheckoutQuery,
  useCommerceCurrenciesQuery,
  useCommerceProductsQuery,
  useCommerceStatsQuery,
  useDateRange,
  useMessages,
  useTimezone,
} from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import type { CommerceMetricType } from '@/lib/commerce-reports';
import { CURRENCY_CONFIG, DEFAULT_CURRENCY } from '@/lib/constants';
import { getItem } from '@/lib/storage';
import { RevenueChart } from '../revenue/RevenueChart';
import { CheckoutStages } from './CommerceCheckout';
import { CommerceMetricsBar } from './CommerceMetricsBar';
import { CommerceMetricsTable } from './CommerceMetricsTable';
import { currencyFormatter } from './commerceUtils';

interface BoardCommerceProps {
  websiteId: string;
  currency?: string;
}

/** The configured currency, else (`auto`) the website's currency with the most orders. */
function useBoardCommerceCurrency(websiteId: string, configured?: string) {
  const selected = configured && configured !== 'auto' ? configured : undefined;
  const { data } = useCommerceCurrenciesQuery(websiteId, { enabled: !selected });

  return (
    selected ||
    data?.[0]?.currency ||
    getItem(CURRENCY_CONFIG) ||
    process.env.defaultCurrency ||
    DEFAULT_CURRENCY
  );
}

export function BoardCommerceMetricsBar({ websiteId, currency: selected }: BoardCommerceProps) {
  const currency = useBoardCommerceCurrency(websiteId, selected);
  const { compare } = useDateRange();
  const { data, isLoading, isFetching, error } = useCommerceStatsQuery(websiteId, {
    currency,
    compare,
  });

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && <CommerceMetricsBar data={data} currency={currency} />}
    </LoadingPanel>
  );
}

export function BoardCommerceChart({ websiteId, currency: selected }: BoardCommerceProps) {
  const currency = useBoardCommerceCurrency(websiteId, selected);
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange({ timezone });
  const { data, isLoading, isFetching, error } = useCommerceChartQuery(websiteId, { currency });

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && (
        <RevenueChart
          data={data.chart}
          unit={unit}
          minDate={startDate}
          maxDate={endDate}
          currency={currency}
        />
      )}
    </LoadingPanel>
  );
}

export function BoardCommerceMetricsTable({
  websiteId,
  currency: selected,
  type = 'channel',
  limit = '10',
}: BoardCommerceProps & { type?: CommerceMetricType; limit?: string | number }) {
  const currency = useBoardCommerceCurrency(websiteId, selected);
  const { t } = useMessages();

  return (
    <CommerceMetricsTable
      websiteId={websiteId}
      scope={{ currency }}
      type={type}
      title={t('commerce.revenue')}
      limit={Number(limit) || 10}
    />
  );
}

export function BoardCommerceProducts({
  websiteId,
  currency: selected,
  limit = '10',
}: BoardCommerceProps & { limit?: string | number }) {
  const currency = useBoardCommerceCurrency(websiteId, selected);
  const { t } = useMessages();
  const { data, isLoading, isFetching, error } = useCommerceProductsQuery(websiteId, {
    currency,
    pageSize: Number(limit) || 10,
  });
  const products = data?.data || [];
  const total = products.reduce((sum, { revenue }) => sum + revenue, 0);

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      <Grid padding="2">
        <ListTable
          title={t('commerce.products')}
          metric={t('commerce.revenue')}
          formatCount={currencyFormatter(currency)}
          itemCount={Number(limit) || 10}
          data={products.map(({ name, productId, revenue }) => ({
            label: name || productId,
            count: revenue,
            percent: total ? (revenue / total) * 100 : 0,
          }))}
        />
      </Grid>
    </LoadingPanel>
  );
}

export function BoardCommerceCheckout({ websiteId, currency: selected }: BoardCommerceProps) {
  const currency = useBoardCommerceCurrency(websiteId, selected);
  const { data, isLoading, isFetching, error } = useCommerceCheckoutQuery(websiteId, { currency });

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && <CheckoutStages data={data} />}
    </LoadingPanel>
  );
}
