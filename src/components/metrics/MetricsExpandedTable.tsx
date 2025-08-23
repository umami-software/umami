import { ReactNode, useState } from 'react';
import { Button, Column, DataColumn, DataTable, Icon, Row, SearchField } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useWebsiteExpandedMetricsQuery } from '@/components/hooks';
import { Close } from '@/components/icons';
import { DownloadButton } from '@/components/input/DownloadButton';
import { formatShortTime } from '@/lib/format';
import { MetricLabel } from '@/components/metrics/MetricLabel';

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
                <Close />
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
      >
        <Column overflowY="auto" minHeight="0" height="100%" paddingRight="3" overflow="hidden">
          {items && (
            <DataTable data={items}>
              <DataColumn id="label" label={title} width="2fr" align="start">
                {row => <MetricLabel type={type} data={row} />}
              </DataColumn>
              <DataColumn id="visitors" label={formatMessage(labels.visitors)} align="end">
                {row => row?.['visitors']?.toLocaleString()}
              </DataColumn>
              <DataColumn id="visits" label={formatMessage(labels.visits)} align="end">
                {row => row?.['visits']?.toLocaleString()}
              </DataColumn>
              <DataColumn id="pageviews" label={formatMessage(labels.views)} align="end">
                {row => row?.['pageviews']?.toLocaleString()}
              </DataColumn>
              <DataColumn id="bounceRate" label={formatMessage(labels.bounceRate)} align="end">
                {row => {
                  const n = (Math.min(row?.['visits'], row?.['bounces']) / row?.['visits']) * 100;
                  return Math.round(+n) + '%';
                }}
              </DataColumn>
              <DataColumn
                id="visitDuration"
                label={formatMessage(labels.visitDuration)}
                align="end"
              >
                {row => {
                  const n = (row?.['totaltime'] / row?.['visits']) * 100;
                  return `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`;
                }}
              </DataColumn>
            </DataTable>
          )}
        </Column>
      </LoadingPanel>
    </>
  );
}
