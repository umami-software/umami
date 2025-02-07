import { useApi } from '../useApi';
import { useCountryNames } from '@/components/hooks/useCountryNames';
import { useRegionNames } from '@/components/hooks/useRegionNames';
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

      if (values) {
        return (
          Object.keys(values)
            .reduce((arr: string[], key: string) => {
              if (values[key].toLowerCase().includes(value.toLowerCase())) {
                return arr.concat(key);
              }
              return arr;
            }, [])
            .slice(0, 5)
            .join(',') || value
        );
      }

      return value;
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
