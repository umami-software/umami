import type { QueryFilters } from './types';

export function sanitizeSortFilters<const T extends readonly string[]>(
  filters: QueryFilters = {},
  allowedFields: T,
  defaults: Partial<Pick<QueryFilters, 'orderBy' | 'sortDescending'>> = {},
): QueryFilters {
  const { orderBy, sortDescending, ...rest } = filters;
  const fallbackOrderBy = defaults.orderBy;
  const fallbackSortDescending = defaults.sortDescending;
  const isAllowed = orderBy ? allowedFields.includes(orderBy as T[number]) : false;

  return {
    ...rest,
    ...(isAllowed
      ? {
          orderBy,
          sortDescending,
        }
      : {
          ...(fallbackOrderBy && { orderBy: fallbackOrderBy }),
          ...(fallbackSortDescending !== undefined && {
            sortDescending: fallbackSortDescending,
          }),
        }),
  };
}
