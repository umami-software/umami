import { ListItem, Row, Select } from '@umami/react-zen';
import { useCommerceMetricsQuery, useMessages } from '@/components/hooks';
import { CurrencySelect } from '@/components/input/CurrencySelect';
import type { CommerceCurrency } from '@/queries/sql/commerce/getCommerceCurrencies';

const ALL_MARKETS = '__all__';

export interface CommerceToolbarProps {
  websiteId: string;
  currency: string;
  market?: string;
  currencies?: CommerceCurrency[];
  onCurrencyChange: (currency: string) => void;
  onMarketChange: (market?: string) => void;
}

export function CommerceToolbar({
  websiteId,
  currency,
  market,
  currencies,
  onCurrencyChange,
  onMarketChange,
}: CommerceToolbarProps) {
  const { t, labels } = useMessages();
  // Markets with completed payments in the selected currency and period.
  const { data: markets } = useCommerceMetricsQuery(websiteId, {
    currency,
    type: 'market',
    limit: 200,
  });
  const marketNames = (markets || []).map(({ name }) => name).filter(Boolean);

  return (
    <Row gap wrap="wrap" alignItems="flex-end">
      <Row width="280px">
        {currencies?.length ? (
          <Select
            label={t(labels.currency)}
            value={currency}
            onChange={value => onCurrencyChange(String(value))}
            buttonProps={{ style: { width: '100%' } }}
          >
            {(currencies.some(c => c.currency === currency)
              ? currencies
              : [{ currency, orders: 0, revenue: 0 }, ...currencies]
            ).map(({ currency: id, orders }) => (
              <ListItem key={id} id={id}>
                {`${id} (${orders.toLocaleString()} ${t('commerce.orders').toLowerCase()})`}
              </ListItem>
            ))}
          </Select>
        ) : (
          <CurrencySelect value={currency} onChange={onCurrencyChange} />
        )}
      </Row>
      {(marketNames.length > 1 || market) && (
        <Row width="220px">
          <Select
            label={t('commerce.market')}
            value={market || ALL_MARKETS}
            onChange={value => onMarketChange(value === ALL_MARKETS ? undefined : String(value))}
            buttonProps={{ style: { width: '100%' } }}
          >
            {[ALL_MARKETS, ...new Set([...(market ? [market] : []), ...marketNames])].map(id => (
              <ListItem key={id} id={id}>
                {id === ALL_MARKETS ? t('commerce.allMarkets') : id}
              </ListItem>
            ))}
          </Select>
        </Row>
      )}
    </Row>
  );
}
