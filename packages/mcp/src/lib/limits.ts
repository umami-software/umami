export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_METRIC_LIMIT = 20;
export const MAX_METRIC_LIMIT = 500;
export const MAX_SESSION_ACTIVITY = 200;

export function clamp(value: number | undefined, fallback: number, max: number) {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(Math.max(Math.trunc(value), 1), max);
}

export interface PageInfo {
  page: number;
  pageSize: number;
  count: number;
  hasMore: boolean;
}

export function pageInfo(result: { page?: number; pageSize?: number; count?: number }): PageInfo {
  const page = result.page ?? 1;
  const pageSize = result.pageSize ?? DEFAULT_PAGE_SIZE;
  const count = result.count ?? 0;

  return { page, pageSize, count, hasMore: page * pageSize < count };
}
