import { ReactNode } from 'react';
import classNames from 'classnames';
import { Loading, SearchField } from 'react-basics';
import { useMessages, useNavigation } from 'components/hooks';
import Empty from 'components/common/Empty';
import Pager from 'components/common/Pager';
import { PagedQueryResult } from 'lib/types';
import styles from './DataTable.module.css';
import { LoadingPanel } from 'components/common/LoadingPanel';

const DEFAULT_SEARCH_DELAY = 600;

export interface DataTableProps {
  queryResult: PagedQueryResult<any>;
  searchDelay?: number;
  allowSearch?: boolean;
  allowPaging?: boolean;
  renderEmpty?: () => ReactNode;
  children: ReactNode | ((data: any) => ReactNode);
}

export function DataTable({
  queryResult,
  searchDelay = 600,
  allowSearch = true,
  allowPaging = true,
  renderEmpty,
  children,
}: DataTableProps) {
  const { formatMessage, labels, messages } = useMessages();
  const {
    result,
    params,
    setParams,
    query: { error, isLoading, isFetched },
  } = queryResult || {};
  const { page, pageSize, count, data } = result || {};
  const { query } = params || {};
  const hasData = Boolean(!isLoading && data?.length);
  const noResults = Boolean(query && !hasData);
  const { router, renderUrl } = useNavigation();

  const handleSearch = (query: string) => {
    setParams({ ...params, query, page: params.page ? page : 1 });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, query, page });
    router.push(renderUrl({ page }));
  };

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
      <LoadingPanel data={data} isLoading={isLoading} isFetched={isFetched} error={error}>
        <div
          className={classNames(styles.body, {
            [styles.status]: isLoading || noResults || !hasData,
          })}
        >
          {hasData ? (typeof children === 'function' ? children(result) : children) : null}
          {isLoading && <Loading position="page" />}
          {!isLoading && !hasData && !query && (renderEmpty ? renderEmpty() : <Empty />)}
          {!isLoading && noResults && <Empty message={formatMessage(messages.noResultsFound)} />}
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
      </LoadingPanel>
    </>
  );
}

export default DataTable;
