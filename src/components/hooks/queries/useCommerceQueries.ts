import { keepPreviousData } from '@tanstack/react-query';
import { serializeAnalyticsQuery } from '@/lib/analytics-query';
import type {
  CommerceAttributionModel,
  CommerceMetricType,
  CommerceProductGroup,
  CommerceProductSort,
} from '@/lib/commerce-reports';
import { MAX_PAGING_RESULTS } from '@/lib/constants';
import type { ReactQueryOptions } from '@/lib/types';
import type { CommerceAttribution } from '@/queries/sql/commerce/getCommerceAttribution';
import type { CommerceBaskets } from '@/queries/sql/commerce/getCommerceBaskets';
import type { CommerceChartPoint } from '@/queries/sql/commerce/getCommerceChart';
import type { CommerceCheckout } from '@/queries/sql/commerce/getCommerceCheckout';
import type { CommerceCurrency } from '@/queries/sql/commerce/getCommerceCurrencies';
import type { CommerceCustomers } from '@/queries/sql/commerce/getCommerceCustomers';
import type { CommerceMetric } from '@/queries/sql/commerce/getCommerceMetrics';
import type { CommerceOrderDetail } from '@/queries/sql/commerce/getCommerceOrder';
import type { CommerceStats } from '@/queries/sql/commerce/getCommerceStats';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import { usePagedQuery } from '../usePagedQuery';
import { useAnalyticsQuery } from './useAnalyticsQuery';

/** Narrows commerce reports to one currency, and optionally a market, product or category. */
export interface CommerceScope {
  currency: string;
  market?: string;
  productId?: string;
  category?: string;
}

export type CommerceStatsData = CommerceStats & { comparison: CommerceStats };

function scopeParams({ currency, market, productId, category }: CommerceScope) {
  return { currency, market, productId, category };
}

function useCommerceQuery<T>(
  path: string,
  websiteId: string,
  params: Record<string, any>,
  options?: ReactQueryOptions<T>,
) {
  return useAnalyticsQuery<T>(`commerce/${path}`, { websiteId, ...params }, {
    placeholderData: keepPreviousData,
    ...options,
    enabled:
      !!(websiteId && (params.currency || path === 'currencies')) && options?.enabled !== false,
  } as ReactQueryOptions<T>);
}

export function useCommerceCurrenciesQuery(
  websiteId: string,
  options?: ReactQueryOptions<CommerceCurrency[]>,
) {
  return useCommerceQuery<CommerceCurrency[]>('currencies', websiteId, {}, options);
}

export function useCommerceStatsQuery(
  websiteId: string,
  scope: CommerceScope & { compare?: string },
  options?: ReactQueryOptions<CommerceStatsData>,
) {
  return useCommerceQuery<CommerceStatsData>(
    'stats',
    websiteId,
    { ...scopeParams(scope), compare: scope.compare },
    options,
  );
}

export function useCommerceChartQuery(
  websiteId: string,
  scope: CommerceScope,
  options?: ReactQueryOptions<{ chart: CommerceChartPoint[] }>,
) {
  return useCommerceQuery<{ chart: CommerceChartPoint[] }>(
    'chart',
    websiteId,
    scopeParams(scope),
    options,
  );
}

export function useCommerceMetricsQuery(
  websiteId: string,
  scope: CommerceScope & { type: CommerceMetricType; limit?: number },
  options?: ReactQueryOptions<CommerceMetric[]>,
) {
  return useCommerceQuery<CommerceMetric[]>(
    'metrics',
    websiteId,
    { ...scopeParams(scope), type: scope.type, limit: scope.limit },
    options,
  );
}

export function useCommerceBasketsQuery(
  websiteId: string,
  scope: CommerceScope,
  options?: ReactQueryOptions<CommerceBaskets>,
) {
  return useCommerceQuery<CommerceBaskets>('baskets', websiteId, scopeParams(scope), options);
}

export function useCommerceCheckoutQuery(
  websiteId: string,
  scope: CommerceScope,
  options?: ReactQueryOptions<CommerceCheckout>,
) {
  return useCommerceQuery<CommerceCheckout>('checkout', websiteId, scopeParams(scope), options);
}

export function useCommerceCustomersQuery(
  websiteId: string,
  scope: CommerceScope,
  options?: ReactQueryOptions<CommerceCustomers>,
) {
  return useCommerceQuery<CommerceCustomers>('customers', websiteId, scopeParams(scope), options);
}

export function useCommerceAttributionQuery(
  websiteId: string,
  scope: CommerceScope & { model: CommerceAttributionModel },
  options?: ReactQueryOptions<CommerceAttribution>,
) {
  return useCommerceQuery<CommerceAttribution>(
    'attribution',
    websiteId,
    { ...scopeParams(scope), model: scope.model },
    options,
  );
}

export function useCommerceOrderQuery(websiteId: string, commerceEventId?: string) {
  const { get, useQuery } = useApi();

  return useQuery<CommerceOrderDetail>({
    queryKey: ['websites:commerce/order', { websiteId, commerceEventId }],
    queryFn: () => get(`/websites/${websiteId}/commerce/orders/${commerceEventId}`),
    enabled: !!(websiteId && commerceEventId),
  });
}

/** Paged commerce lists. Page and search come from the URL, as in other data grids. */
function useCommercePagedQuery(
  path: string,
  websiteId: string,
  params: Record<string, any>,
  enabled = true,
) {
  const { get } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: [
      `websites:commerce/${path}`,
      { websiteId, startAt, endAt, unit, timezone, ...params, ...filters },
    ],
    queryFn: pageParams =>
      get(
        `/websites/${websiteId}/commerce/${path}`,
        serializeAnalyticsQuery({
          startAt,
          endAt,
          unit,
          timezone,
          ...filters,
          ...pageParams,
          ...params,
          maxResults: MAX_PAGING_RESULTS,
        }),
      ),
    enabled: !!(websiteId && params.currency) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCommerceOrdersQuery(websiteId: string, scope: CommerceScope) {
  return useCommercePagedQuery('orders', websiteId, scopeParams(scope));
}

export function useCommerceProductsQuery(
  websiteId: string,
  scope: CommerceScope & {
    groupBy?: CommerceProductGroup;
    sort?: CommerceProductSort;
    pageSize?: number;
  },
) {
  return useCommercePagedQuery('products', websiteId, {
    ...scopeParams(scope),
    groupBy: scope.groupBy,
    sort: scope.sort,
    pageSize: scope.pageSize,
  });
}

export function useCommerceAbandonedQuery(websiteId: string, scope: CommerceScope) {
  return useCommercePagedQuery('abandoned', websiteId, scopeParams(scope));
}

export function useCommerceBuyersQuery(websiteId: string, scope: CommerceScope, enabled = true) {
  return useCommercePagedQuery('buyers', websiteId, scopeParams(scope), enabled);
}
