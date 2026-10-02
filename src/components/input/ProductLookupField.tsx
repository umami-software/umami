import { ListItem, Loading, useDebounce } from '@umami/react-zen';
import { endOfDay, subMonths } from 'date-fns';
import { useMemo, useState } from 'react';
import { ComboBox } from '@/components/common/ComboBox';
import { useApi, useCommerceCurrenciesQuery, useMessages } from '@/components/hooks';
import type { CommerceProduct } from '@/queries/sql/commerce/getCommerceProducts';

/** Matches any product. */
export const ANY_PRODUCT = '*';

export interface ProductLookupFieldProps {
  websiteId: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Picks a product ID for order goals and purchase cohorts. Suggests products bought in the
 * last six months, and accepts any typed ID or `*` for any product.
 */
export function ProductLookupField({ websiteId, value, onChange }: ProductLookupFieldProps) {
  const { t } = useMessages();
  const { get, useQuery } = useApi();
  const [search, setSearch] = useState(value === ANY_PRODUCT ? '' : value);
  const searchValue = useDebounce(search, 300);
  const range = useMemo(() => {
    const endAt = +endOfDay(new Date());

    return { startAt: +subMonths(endAt, 6), endAt };
  }, []);
  const { data: currencies } = useCommerceCurrenciesQuery(websiteId);
  const currency = currencies?.[0]?.currency;

  const { data, isLoading } = useQuery<{ data: CommerceProduct[] }>({
    queryKey: ['websites:commerce/products:lookup', { websiteId, currency, searchValue, ...range }],
    queryFn: () =>
      get(`/websites/${websiteId}/commerce/products`, {
        ...range,
        currency,
        search: searchValue || undefined,
        pageSize: 10,
      }),
    enabled: !!(websiteId && currency),
  });

  const products = data?.data || [];
  const options = [
    { id: ANY_PRODUCT, label: t('commerce.anyProduct') },
    ...(value && value !== ANY_PRODUCT && !products.some(p => p.productId === value)
      ? [{ id: value, label: value }]
      : []),
    ...products.map(({ productId, name }) => ({
      id: productId,
      label: name && name !== productId ? `${name} (${productId})` : productId,
    })),
  ];

  return (
    <ComboBox
      aria-label={t('commerce.product')}
      items={options.map(option => option.id)}
      inputValue={value === ANY_PRODUCT ? t('commerce.anyProduct') : value}
      onInputValueChange={input => {
        const next = input === t('commerce.anyProduct') ? ANY_PRODUCT : input;
        setSearch(next === ANY_PRODUCT ? '' : next);
        onChange(next);
      }}
      onChange={key => key && onChange(String(key))}
      renderEmptyState={() => (isLoading ? <Loading placement="center" icon="dots" /> : null)}
    >
      {options.map(({ id, label }) => (
        <ListItem key={id} id={id}>
          {label}
        </ListItem>
      ))}
    </ComboBox>
  );
}
