import { useNavigation } from '@/components/hooks';
import { OPERATORS } from '@/lib/constants';
import { parseFilterValue } from '@/lib/params';

export function useWebsiteSearchTermsFilters() {
  const { query } = useNavigation();

  const rawPath = query.path as string | undefined;

  const { operator: pathOperator, value: pathValue } = rawPath
    ? parseFilterValue(rawPath)
    : { operator: undefined, value: undefined };

  const path =
    pathOperator === OPERATORS.equals || pathOperator === OPERATORS.contains
      ? Array.isArray(pathValue)
        ? pathValue[0]
        : (pathValue as string)
      : undefined;

  const rawCountry = query.country as string | undefined;

  const { operator: countryOperator, value: countryValue } = rawCountry
    ? parseFilterValue(rawCountry)
    : { operator: undefined, value: undefined };

  const country =
    countryOperator === OPERATORS.equals
      ? Array.isArray(countryValue)
        ? countryValue[0]
        : (countryValue as string)
      : undefined;

  return { path, country };
}
