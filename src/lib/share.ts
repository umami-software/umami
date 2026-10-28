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

export const MAX_EMBED_ORIGINS = 20;

/** Keeps only valid, exact web origins (no paths, no wildcards, no credentials). */
export function normalizeEmbedOrigins(input: unknown): string[] {
  const list = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(/[\s,]+/)
      : [];
  const origins = new Set<string>();

  for (const item of list) {
    if (typeof item !== 'string' || !item.trim()) {
      continue;
    }

    try {
      const url = new URL(item.trim());

      if (
        (url.protocol === 'https:' || url.protocol === 'http:') &&
        !url.username &&
        !url.password &&
        !url.hostname.includes('*')
      ) {
        origins.add(url.origin);
      }
    } catch {
      // ignore invalid entries
    }
  }

  return [...origins].slice(0, MAX_EMBED_ORIGINS);
}

/** Normalizes embed settings stored in share parameters. */
export function sanitizeShareParameters<T extends Record<string, any>>(parameters: T): T {
  const result: Record<string, any> = { ...parameters };

  if (result.embed === true) {
    result.embedOrigins = normalizeEmbedOrigins(result.embedOrigins);
  } else {
    delete result.embed;
    delete result.embedOrigins;
  }

  return result as T;
}

/** CSP frame-ancestors value for an embed: only the owner-approved origins (plus self). */
export function getEmbedFrameAncestors(parameters?: ShareParameters | null): string {
  if (!parameters?.embed) {
    return "'none'";
  }

  return ["'self'", ...normalizeEmbedOrigins(parameters.embedOrigins)].join(' ');
}
