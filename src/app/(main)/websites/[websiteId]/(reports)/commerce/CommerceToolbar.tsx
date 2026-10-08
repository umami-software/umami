import { ListItem, Row, Select } from '@umami/react-zen';
import { useCommerceMarketsQuery, useMessages } from '@/components/hooks';
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
  const { data: markets } = useCommerceMarketsQuery(websiteId, currency);
  const marketNames = (markets || []).map(({ name }) => name).filter(Boolean);

  return (
    <Row gap wrap="wrap" alignItems="flex-end">
      {currencies?.length ? (
        <Select
          label={t(labels.currency)}
          value={currency}
          onChange={value => onCurrencyChange(String(value))}
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
      {(marketNames.length > 1 || market) && (
        <Select
          label={t('commerce.market')}
          value={market || ALL_MARKETS}
          onChange={value => onMarketChange(value === ALL_MARKETS ? undefined : String(value))}
        >
          {[ALL_MARKETS, ...new Set([...(market ? [market] : []), ...marketNames])].map(id => (
            <ListItem key={id} id={id}>
              {id === ALL_MARKETS ? t('commerce.allMarkets') : id}
            </ListItem>
          ))}
        </Select>
      )}
    </Row>
  );
}
