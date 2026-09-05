import { useMemo } from 'react';
import { FILTER_COLUMNS } from '@/lib/constants';
import { mergeFilterParams } from '@/lib/params';
import { useFilterScope } from './context/useFilterScope';
import { useShare } from './context/useShare';
import { useNavigation } from './useNavigation';

export function useFilterParameters({
  includePagination = true,
}: {
  includePagination?: boolean;
} = {}) {
  const { pathname, query } = useNavigation();
  const share = useShare();
  const scope = useFilterScope();
  const allowFilter = share?.parameters?.allowFilter !== false;
  const isEventsPath = pathname.endsWith('/events');

  return useMemo(() => {
    const filterParams: Record<string, any> = {};

    if (allowFilter) {
      for (const key of Object.keys(query)) {
        const baseName = key.replace(/\d+$/, '');
        if (
          FILTER_COLUMNS[baseName] ||
          /^spf\d+$/.test(key) ||
          (isEventsPath && /^epf\d+$/.test(key))
        ) {
          filterParams[key] = query[key];
        }
      }
    }

    // Scoped filters (e.g. a board row's saved filters) are part of the view's
    // definition rather than the viewer's selection, so they apply even when
    // share links disallow filtering. They narrow the URL's filters rather
    // than replacing them — see mergeFilterParams.
    const scopeParams = scope?.params ?? {};

    const params = {
      ...mergeFilterParams(filterParams, scopeParams),
      search: query.search,
      segment: scopeParams.segment ?? (allowFilter ? query.segment : undefined),
      cohort: scopeParams.cohort ?? (allowFilter ? query.cohort : undefined),
      excludeBounce: allowFilter ? query.excludeBounce : undefined,
      match: scopeParams.match ?? (allowFilter ? query.match : undefined),
    } as Record<string, any>;

    if (includePagination) {
      params.page = query.page;
      params.pageSize = query.pageSize;
    }

    return params;
  }, [allowFilter, includePagination, isEventsPath, query, scope?.params]);
}
