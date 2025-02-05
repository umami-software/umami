import { ReactNode } from 'react';
import classNames from 'classnames';
import { Loading, SearchField } from 'react-basics';
import { useMessages, useNavigation } from '@/components/hooks';
import Empty from '@/components/common/Empty';
import Pager from '@/components/common/Pager';
import { PagedQueryResult } from '@/lib/types';
import styles from './DataTable.module.css';
import { LoadingPanel } from '@/components/common/LoadingPanel';

const DEFAULT_SEARCH_DELAY = 600;

export interface DataTableProps {
  queryResult: PagedQueryResult<any>;
  searchDelay?: number;
  allowSearch?: boolean;
  allowPaging?: boolean;
  autoFocus?: boolean;
  renderEmpty?: () => ReactNode;
  children: ReactNode | ((data: any) => ReactNode);
}

export function DataTable({
  queryResult,
  searchDelay = 600,
  allowSearch = true,
  allowPaging = true,
  autoFocus = true,
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
  const { search } = params || {};
  const hasData = Boolean(!isLoading && data?.length);
  const noResults = Boolean(search && !hasData);
  const { router, renderUrl } = useNavigation();

  const handleSearch = (search: string) => {
    setParams({ ...params, search, page: params.page ? page : 1 });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, search, page });
    router.push(renderUrl({ page }));
  };

  return (
    <>
      {allowSearch && (hasData || search) && (
        <SearchField
          className={styles.search}
          value={search}
          onSearch={handleSearch}
          delay={searchDelay || DEFAULT_SEARCH_DELAY}
          autoFocus={autoFocus}
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
          {!isLoading && !hasData && !search && (renderEmpty ? renderEmpty() : <Empty />)}
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
