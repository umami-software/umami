import { Column, DataColumn, DataTable, Row, SearchField } from '@umami/react-zen';
import { type ReactNode, useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Pager } from '@/components/common/Pager';
import { useMessages, useWebsiteExpandedMetricsQuery } from '@/components/hooks';
import { DownloadButton } from '@/components/input/DownloadButton';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import { DEFAULT_PAGE_SIZE, SESSION_COLUMNS } from '@/lib/constants';
import { formatShortTime } from '@/lib/format';

export interface MetricsExpandedTableProps {
  websiteId: string;
  type?: string;
  title?: string;
  dataFilter?: (data: any) => any;
  onSearch?: (search: string) => void;
  params?: { [key: string]: any };
  allowSearch?: boolean;
  allowDownload?: boolean;
  renderLabel?: (row: any, index: number) => ReactNode;
  children?: ReactNode;
}

export function MetricsExpandedTable({
  websiteId,
  type,
  title,
  params,
  allowSearch = true,
  allowDownload = true,
  children,
}: MetricsExpandedTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { t, labels } = useMessages();
  const isType = ['browser', 'country', 'device', 'os'].includes(type);
  const showBounceDuration = SESSION_COLUMNS.includes(type);

  const { data, isLoading, isFetching, error } = useWebsiteExpandedMetricsQuery(websiteId, {
    type,
    search: isType ? undefined : search,
    ...params,
  });

  useEffect(() => {
    setPage(1);
  }, [type, search]);

  const items = data?.map(({ name, ...props }) => ({ label: name, ...props }));
  const pageItems = items?.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);
  const isPending = isLoading || isFetching;

  return (
    <Column gap>
      <Row alignItems="center">
        {allowSearch && (
          <Row width="280px">
            {/* Uncontrolled: `search` only updates after the delay, so binding it to the box would undo each keystroke. */}
            <SearchField onSearch={setSearch} delay={300} className="w-full" />
          </Row>
        )}
        <Row justifyContent="flex-end" flexGrow={1} gap>
          {children}
          {allowDownload && <DownloadButton filename={type} data={data} />}
        </Row>
      </Row>
      {error && !isPending ? (
        <ErrorMessage />
      ) : !isPending && items?.length === 0 ? (
        <Empty />
      ) : (
        <Column overflowX="auto">
          {(pageItems || isPending) && (
            <DataTable
              data={pageItems ?? []}
              loading={isPending}
              // Keep the height steady when refetching a page that already has rows.
              loadingRows={pageItems?.length || undefined}
            >
              <DataColumn id="label" label={title} width="minmax(200px, 2fr)" align="start">
                {row => (
                  <Row overflow="hidden">
                    <MetricLabel type={type} data={row} />
                  </Row>
                )}
              </DataColumn>
              <DataColumn id="visitors" label={t(labels.visitors)} align="end" width="120px">
                {row => row?.visitors?.toLocaleString()}
              </DataColumn>
              <DataColumn id="visits" label={t(labels.visits)} align="end" width="120px">
                {row => row?.visits?.toLocaleString()}
              </DataColumn>
              <DataColumn id="pageviews" label={t(labels.views)} align="end" width="120px">
                {row => row?.pageviews?.toLocaleString()}
              </DataColumn>
              {showBounceDuration && [
                <DataColumn
                  key="bounceRate"
                  id="bounceRate"
                  label={t(labels.bounceRate)}
                  align="end"
                  width="120px"
                >
                  {row => {
                    const n = (Math.min(row?.visits, row?.bounces) / row?.visits) * 100;
                    return `${Math.round(+n)}%`;
                  }}
                </DataColumn>,

                <DataColumn
                  key="visitDuration"
                  id="visitDuration"
                  label={t(labels.visitDuration)}
                  align="end"
                  width="120px"
                >
                  {row => {
                    const n = row?.totaltime / row?.visits;
                    return `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`;
                  }}
                </DataColumn>,
              ]}
            </DataTable>
          )}
        </Column>
      )}
      {items && items.length > 0 && (
        <Row>
          <Pager
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            count={items.length}
            onPageChange={setPage}
          />
        </Row>
      )}
    </Column>
  );
}
