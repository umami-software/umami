import { useState } from 'react';
import { usePaging } from 'components/hooks/usePaging';

export function useDataTable(config = {}) {
  const { initialData, initialQuery, initialPageInfo } = config;
  const [data, setData] = useState(initialData ?? null);
  const [query, setQuery] = useState(initialQuery ?? '');
  const { pageInfo, setPageInfo } = usePaging(initialPageInfo);

  return { data, setData, query, setQuery, pageInfo, setPageInfo };
}

export default useDataTable;
