import { useMemo } from 'react';
import { FILTER_COLUMNS } from '@/lib/constants';
import { useNavigation } from './useNavigation';

export function useFilterParameters() {
  const { query } = useNavigation();

  return useMemo(() => {
    const filterParams: Record<string, any> = {};

    for (const key of Object.keys(query)) {
      const baseName = key.replace(/\d+$/, '');
      if (FILTER_COLUMNS[baseName]) {
        filterParams[key] = query[key];
      }
    }

    return {
      ...filterParams,
      search: query.search,
      segment: query.segment,
      cohort: query.cohort,
      excludeBounce: query.excludeBounce,
      match: query.match,
      page: query.page,
      pageSize: query.pageSize,
    };
  }, [query]);
}
