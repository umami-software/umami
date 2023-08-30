import { useState } from 'react';

export function useApiFilter() {
  const [filter, setFilter] = useState();
  const [filterType, setFilterType] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleFilterChange = value => setFilter(value);
  const handlePageChange = value => setPage(value);
  const handlePageSizeChange = value => setPageSize(value);

  return {
    filter,
    setFilter,
    filterType,
    setFilterType,
    page,
    setPage,
    pageSize,
    setPageSize,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  };
}

export default useApiFilter;
