import { useNavigation } from '@/components/hooks';
import { GOOGLE_DOMAINS, OPERATORS } from '@/lib/constants';
import { parseFilterValue } from '@/lib/params';
import type { GoogleDomain } from '@/lib/constants';

export function useGoogleDomain(): GoogleDomain | undefined {
  const { query } = useNavigation();

  const rawReferrer = query.referrer as string | undefined;

  const { operator: referrerOperator, value: referrerValue } = rawReferrer
    ? parseFilterValue(rawReferrer)
    : { operator: undefined, value: undefined };

  if (referrerOperator !== OPERATORS.equals) {
    return undefined;
  }

  const value = Array.isArray(referrerValue) ? referrerValue[0] : referrerValue;

  return GOOGLE_DOMAINS.find(d => d === value);
}
