import { ReactNode, useState } from 'react';
import { Button, Column, DataColumn, DataTable, Icon, Row, SearchField } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useWebsiteExpandedMetricsQuery } from '@/components/hooks';
import { X } from '@/components/icons';
import { DownloadButton } from '@/components/input/DownloadButton';
import { formatShortTime } from '@/lib/format';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import { SESSION_COLUMNS } from '@/lib/constants';

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
  onClose?: () => void;
  children?: ReactNode;
}

export function MetricsExpandedTable({
  websiteId,
  type,
  title,
  params,
  allowSearch = true,
  allowDownload = true,
  onClose,
  children,
}: MetricsExpandedTableProps) {
  const [search, setSearch] = useState('');
  const { formatMessage, labels } = useMessages();
  const isType = ['browser', 'country', 'device', 'os'].includes(type);
  const showBounceDuration = SESSION_COLUMNS.includes(type);

  const { data, isLoading, isFetching, error } = useWebsiteExpandedMetricsQuery(websiteId, {
    type,
    search: isType ? undefined : search,
    ...params,
  });

  const items = data?.map(({ name, ...props }) => ({ label: name, ...props }));

  return (
    <>
      <Row alignItems="center" paddingBottom="3">
        {allowSearch && <SearchField value={search} onSearch={setSearch} delay={300} />}
        <Row justifyContent="flex-end" flexGrow={1} gap>
          {children}
          {allowDownload && <DownloadButton filename={type} data={data} />}
          {onClose && (
            <Button onPress={onClose} variant="quiet">
              <Icon>
                <X />
              </Icon>
            </Button>
          )}
        </Row>
      </Row>
      <LoadingPanel
        data={data}
        isFetching={isFetching}
        isLoading={isLoading}
        error={error}
        height="100%"
        loadingIcon="spinner"
      >
        <Column overflow="auto" minHeight="0" height="100%" paddingRight="3">
          {items && (
            <DataTable data={items}>
              <DataColumn id="label" label={title} width="minmax(200px, 2fr)" align="start">
                {row => (
                  <Row overflow="hidden">
                    <MetricLabel type={type} data={row} />
                  </Row>
                )}
              </DataColumn>
              <DataColumn
                id="visitors"
                label={formatMessage(labels.visitors)}
                align="end"
                width="120px"
              >
                {row => row?.['visitors']?.toLocaleString()}
              </DataColumn>
              <DataColumn
                id="visits"
                label={formatMessage(labels.visits)}
                align="end"
                width="120px"
              >
                {row => row?.['visits']?.toLocaleString()}
              </DataColumn>
              <DataColumn
                id="pageviews"
                label={formatMessage(labels.views)}
                align="end"
                width="120px"
              >
                {row => row?.['pageviews']?.toLocaleString()}
              </DataColumn>
              {showBounceDuration && [
                <DataColumn
                  key="bounceRate"
                  id="bounceRate"
                  label={formatMessage(labels.bounceRate)}
                  align="end"
                  width="120px"
                >
                  {row => {
                    const n = (Math.min(row?.['visits'], row?.['bounces']) / row?.['visits']) * 100;
                    return Math.round(+n) + '%';
                  }}
                </DataColumn>,

                <DataColumn
                  key="visitDuration"
                  id="visitDuration"
                  label={formatMessage(labels.visitDuration)}
                  align="end"
                  width="120px"
                >
                  {row => {
                    const n = row?.['totaltime'] / row?.['visits'];
                    return `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`;
                  }}
                </DataColumn>,
              ]}
            </DataTable>
          )}
        </Column>
      </LoadingPanel>
    </>
  );
}
