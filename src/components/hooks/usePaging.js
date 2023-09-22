import { useState } from 'react';

const DEFAULT_PAGE_INFO = { page: 1, pageSize: 10, total: 0 };

export function usePaging(initialPageInfo) {
  const [pageInfo, setPageInfo] = useState(initialPageInfo ?? { ...DEFAULT_PAGE_INFO });

  return { pageInfo, setPageInfo };
}
