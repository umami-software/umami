import { useMemo } from 'react';
import { type CommerceScope, useCommerceCurrenciesQuery, useNavigation } from '@/components/hooks';
import { CURRENCY_CONFIG, DEFAULT_CURRENCY } from '@/lib/constants';
import { getItem, setItem } from '@/lib/storage';

/**
 * The currency and market the commerce report is narrowed to. The currency comes from the
 * URL, then the remembered currency if it has orders, then the currency with the most orders.
 */
export function useCommerceScope(websiteId: string) {
  const { query, router, updateParams } = useNavigation();
  const currenciesQuery = useCommerceCurrenciesQuery(websiteId);
  const currencies = currenciesQuery.data;
  // Wait for the list: it also decides whether the website has any commerce data.
  const isReady = !currenciesQuery.isLoading;

  const currency = useMemo(() => {
    if (query.currency) {
      return String(query.currency).toUpperCase();
    }

    const stored = getItem(CURRENCY_CONFIG);

    if (currencies?.length) {
      return currencies.some(({ currency }) => currency === stored)
        ? stored
        : currencies[0].currency;
    }

    return stored || process.env.defaultCurrency || DEFAULT_CURRENCY;
  }, [query.currency, currencies]);

  const market = query.market || undefined;

  const navigate = (params: Record<string, string | undefined>) => {
    router.replace(updateParams({ ...params, page: undefined, search: undefined }), {
      scroll: false,
    });
  };

  const setCurrency = (value: string) => {
    setItem(CURRENCY_CONFIG, value);
    navigate({ currency: value, market: undefined, product: undefined });
  };

  const setMarket = (value?: string) => {
    navigate({ market: value || undefined });
  };

  const scope: CommerceScope = useMemo(() => ({ currency, market }), [currency, market]);

  return {
    currency,
    market,
    scope,
    currencies,
    hasData: !!currencies?.length,
    isReady,
    isLoading: currenciesQuery.isLoading,
    setCurrency,
    setMarket,
  };
}
