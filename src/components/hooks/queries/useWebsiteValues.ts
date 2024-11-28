import { useApi } from '../useApi';
import { useCountryNames, useRegionNames } from 'components/hooks';
import useLocale from '../useLocale';

export function useWebsiteValues({
  websiteId,
  type,
  startDate,
  endDate,
  search,
}: {
  websiteId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  search?: string;
}) {
  const { get, useQuery } = useApi();
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);
  const { regionNames } = useRegionNames(locale);

  const names = {
    country: countryNames,
    region: regionNames,
  };

  const getSearch = (type: string, value: string) => {
    if (value) {
      const values = names[type];
      return Object.keys(values).reduce((code: string, key: string) => {
        if (!code && values[key].toLowerCase().includes(value.toLowerCase())) {
          code = key;
        }
        return code;
      }, '');
    }
  };

  return useQuery({
    queryKey: ['websites:values', { websiteId, type, startDate, endDate, search }],
    queryFn: () =>
      get(`/websites/${websiteId}/values`, {
        type,
        startAt: +startDate,
        endAt: +endDate,
        search: getSearch(type, search),
      }),
    enabled: !!(websiteId && type && startDate && endDate),
  });
}

export default useWebsiteValues;
