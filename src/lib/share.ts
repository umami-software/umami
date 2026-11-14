import { FILTER_COLUMNS } from './constants';
import type { ShareParameters, ShareTheme } from './types';

const FILTER_QUERY_PARAMS = new Set(['cohort', 'excludeBounce', 'match', 'segment']);

export function allowShareFilter(parameters?: ShareParameters | null) {
  return parameters?.allowFilter !== false && !Object.keys(parameters?.presetFilters ?? {}).length;
}

export function applySharePresetFilters(
  query: Record<string, any>,
  parameters?: ShareParameters | null,
) {
  const presetFilters = parameters?.presetFilters;

  if (!presetFilters || !Object.keys(presetFilters).length) {
    return query;
  }

  const isFilterParam = (key: string) =>
    excludeShareFilterParam(key) || /^epf\d+$/.test(key) || /^spf\d+$/.test(key);

  return {
    ...Object.fromEntries(Object.entries(query).filter(([key]) => !isFilterParam(key))),
    ...Object.fromEntries(
      Object.entries(presetFilters).filter(
        ([key, value]) => isFilterParam(key) && typeof value === 'string',
      ),
    ),
  };
}

export function getShareTheme(parameters?: ShareParameters | null): ShareTheme | undefined {
  return parameters?.theme === 'light' || parameters?.theme === 'dark'
    ? parameters.theme
    : undefined;
}

export function excludeShareFilterParam(key: string) {
  const baseName = key.replace(/\d+$/, '');

  return Object.hasOwn(FILTER_COLUMNS, baseName) || FILTER_QUERY_PARAMS.has(key);
}
