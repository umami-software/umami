import { useMemo } from 'react';
import { FILTER_COLUMNS } from '@/lib/constants';
import { useShare } from './context/useShare';
import { useNavigation } from './useNavigation';

export function useFilterParameters({
  includePagination = true,
}: {
  includePagination?: boolean;
} = {}) {
  const { query } = useNavigation();
  const share = useShare();
  const allowFilter = share?.parameters?.allowFilter !== false;

  return useMemo(() => {
    const filterParams: Record<string, any> = {};

    if (allowFilter) {
      for (const key of Object.keys(query)) {
        const baseName = key.replace(/\d+$/, '');
        if (FILTER_COLUMNS[baseName]) {
          filterParams[key] = query[key];
        }
      }
    }

    const params = {
      ...filterParams,
      search: query.search,
      segment: allowFilter ? query.segment : undefined,
      cohort: allowFilter ? query.cohort : undefined,
      excludeBounce: allowFilter ? query.excludeBounce : undefined,
      match: allowFilter ? query.match : undefined,
    } as Record<string, any>;

    if (includePagination) {
      params.page = query.page;
      params.pageSize = query.pageSize;
    }

    return params;
  }, [allowFilter, includePagination, query]);
}
