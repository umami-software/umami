import { useMemo } from 'react';
import { useNavigation } from './useNavigation';

export function usePageParameters() {
  const {
    query: { page, pageSize, search },
  } = useNavigation();

  return useMemo(() => {
    return {
      page,
      pageSize,
      search,
    };
  }, [page, pageSize, search]);
}
