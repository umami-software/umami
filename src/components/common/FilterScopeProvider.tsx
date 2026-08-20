'use client';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

export interface FilterScopeValue {
  params: Record<string, string>;
}

export const FilterScopeContext = createContext<FilterScopeValue | null>(null);

/**
 * Scopes every query inside it to an extra set of filter params, on top of
 * whatever the URL carries. Used by board rows, whose filters are part of the
 * board definition rather than the viewer's current selection — so unlike URL
 * filters they also apply inside share links with `allowFilter: false`.
 *
 * Nested scopes merge, innermost winning.
 */
export function FilterScopeProvider({
  params,
  children,
}: {
  params?: Record<string, string>;
  children: ReactNode;
}) {
  const parent = useContext(FilterScopeContext);

  const value = useMemo(
    () => ({ params: { ...parent?.params, ...params } }),
    [parent?.params, params],
  );

  if (!params || !Object.keys(params).length) {
    return <>{children}</>;
  }

  return <FilterScopeContext.Provider value={value}>{children}</FilterScopeContext.Provider>;
}
