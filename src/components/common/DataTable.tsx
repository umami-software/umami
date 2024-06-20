import { ReactNode } from 'react';
import classNames from 'classnames';
import { Banner, Loading, SearchField } from 'react-basics';
import { useMessages } from 'components/hooks';
import Empty from 'components/common/Empty';
import Pager from 'components/common/Pager';
import { FilterQueryResult } from 'lib/types';
import styles from './DataTable.module.css';

const DEFAULT_SEARCH_DELAY = 600;

export interface DataTableProps {
  queryResult: FilterQueryResult<any>;
  searchDelay?: number;
  allowSearch?: boolean;
  allowPaging?: boolean;
  children: ReactNode | ((data: any) => ReactNode);
}

export function DataTable({
  queryResult,
  searchDelay = 600,
  allowSearch = true,
  allowPaging = true,
  children,
}: DataTableProps) {
  const { formatMessage, labels, messages } = useMessages();
  const {
    result,
    params,
    setParams,
    query: { error, isLoading },
  } = queryResult || {};
  const { page, pageSize, count, data } = result || {};
  const { query } = params || {};
  const hasData = Boolean(!isLoading && data?.length);
  const noResults = Boolean(!isLoading && query && !hasData);

  const handleSearch = (query: string) => {
    setParams({ ...params, query, page: params.page ? page : 1 });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, query, page });
  };

  if (error) {
    return <Banner variant="error">{formatMessage(messages.error)}</Banner>;
  }

  return (
    <>
      {allowSearch && (hasData || query) && (
        <SearchField
          className={styles.search}
          value={query}
          onSearch={handleSearch}
          delay={searchDelay || DEFAULT_SEARCH_DELAY}
          autoFocus={true}
          placeholder={formatMessage(labels.search)}
        />
      )}
      <div
        className={classNames(styles.body, { [styles.status]: isLoading || noResults || !hasData })}
      >
        {hasData ? (typeof children === 'function' ? children(result) : children) : null}
        {isLoading && <Loading position="page" />}
        {!isLoading && !hasData && !query && <Empty />}
        {noResults && <Empty message={formatMessage(messages.noResultsFound)} />}
      </div>
      {allowPaging && hasData && (
        <Pager
          className={styles.pager}
          page={page}
          pageSize={pageSize}
          count={count}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}

export default DataTable;
