import { CURRENCY_CONFIG, DEFAULT_CURRENCY } from '@/lib/constants';
import { getItem } from '@/lib/storage';

export function useBoardRevenueCurrency(currency?: string) {
  return currency || getItem(CURRENCY_CONFIG) || process.env.defaultCurrency || DEFAULT_CURRENCY;
}
