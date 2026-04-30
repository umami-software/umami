import type { ReactQueryOptions } from '@/lib/types';
import { serializePropertyFilters } from '@/lib/params';
import type { PropertyFilter } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useSessionDataPropertiesQuery(
  websiteId: string,
  params?: {
    selectedPropertyName?: string;
    propertyFilters?: PropertyFilter[];
  },
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters({ includePagination: false });
  const { selectedPropertyName, propertyFilters = [] } = params || {};

  return useQuery<any>({
    queryKey: [
      'websites:session-data:properties',
      {
        websiteId,
        selectedPropertyName,
        propertyFilters,
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
      },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/session-data/properties`, {
        startAt,
        endAt,
        unit,
        timezone,
        selectedPropertyName,
        ...serializePropertyFilters(propertyFilters),
        ...filters,
      }),
    enabled: !!websiteId,
    ...options,
  });
}
