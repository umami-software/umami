import { createContext } from 'react';
import { SearchField } from 'react-basics';
import { useDataTable } from 'components/hooks/useDataTable';
import { useMessages } from 'components/hooks';
import Empty from 'components/common/Empty';
import Pager from 'components/common/Pager';
import styles from './DataTable.module.css';

const DEFAULT_SEARCH_DELAY = 1000;

export const DataTableStyles = styles;

export const DataTableContext = createContext(null);

export function DataTable({
  searchDelay,
  showSearch = true,
  showPaging = true,
  children,
  onChange,
}) {
  const { formatMessage, labels, messages } = useMessages();
  const dataTable = useDataTable();
  const { query, setQuery, data, pageInfo, setPageInfo } = dataTable;
  const { page, pageSize, count } = pageInfo || {};
  const noResults = Boolean(query && data?.length === 0);

  const handleChange = () => {
    onChange?.({ query, page });
  };

  const handleSearch = value => {
    setQuery(value);
    handleChange();
  };

  const handlePageChange = page => {
    setPageInfo(state => ({ ...state, page }));
  };

  return (
    <DataTableContext.Provider value={dataTable}>
      {showSearch && (
        <SearchField
          className={styles.search}
          value={query}
          onChange={handleSearch}
          delay={searchDelay || DEFAULT_SEARCH_DELAY}
          autoFocus={true}
          placeholder={formatMessage(labels.search)}
        />
      )}
      {noResults && <Empty message={formatMessage(messages.noResultsFound)} />}
      <div className={styles.body}>{children}</div>
      {showPaging && (
        <Pager
          className={styles.pager}
          page={page}
          pageSize={pageSize}
          count={count}
          onPageChange={handlePageChange}
        />
      )}
    </DataTableContext.Provider>
  );
}

export default DataTable;
