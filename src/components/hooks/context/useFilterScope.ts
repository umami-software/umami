import { useContext } from 'react';
import { FilterScopeContext } from '@/components/common/FilterScopeProvider';

export function useFilterScope() {
  return useContext(FilterScopeContext);
}
