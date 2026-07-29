import { useMemo } from 'react';
import { useNavigation } from './useNavigation';

export function usePageParameters() {
  const {
    query: { page, pageSize, search, orderBy, sortDescending },
  } = useNavigation();

  return useMemo(() => {
    return {
      page,
      pageSize,
      search,
      orderBy,
      sortDescending,
    };
  }, [orderBy, page, pageSize, search, sortDescending]);
}
