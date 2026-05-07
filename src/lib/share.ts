import { FILTER_COLUMNS } from './constants';
import type { ShareParameters, ShareTheme } from './types';

const FILTER_QUERY_PARAMS = new Set(['cohort', 'excludeBounce', 'match', 'segment']);

export function allowShareFilter(parameters?: ShareParameters | null) {
  return parameters?.allowFilter !== false;
}

export function getShareTheme(parameters?: ShareParameters | null): ShareTheme | undefined {
  return parameters?.theme === 'light' || parameters?.theme === 'dark'
    ? parameters.theme
    : undefined;
}

export function excludeShareFilterParam(key: string) {
  const baseName = key.replace(/\d+$/, '');

  return baseName in FILTER_COLUMNS || FILTER_QUERY_PARAMS.has(key);
}
