'use client';
import { Column, DataColumn, DataTable, Tab, TabList, Tabs, Text } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages } from '@/components/hooks';
import { useOutboundLinkMetricsQuery } from '@/components/hooks/queries/useOutboundLinkMetricsQuery';
import { formatLongNumber } from '@/lib/format';

export function OutboundLinksMetrics({ websiteId }: { websiteId: string }) {
  const [type, setType] = useState<Key>('domain');
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useOutboundLinkMetricsQuery(websiteId, {
    type: type as string,
    limit: 20,
  });

  return (
    <Column gap="6">
      <Tabs selectedKey={type} onSelectionChange={setType}>
        <TabList>
          <Tab id="domain">{t(labels.domains)}</Tab>
          <Tab id="url">{t(labels.links)}</Tab>
        </TabList>
      </Tabs>
      <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
        <DataTable data={data}>
          <DataColumn
            id={type === 'domain' ? 'domain' : 'url'}
            label={type === 'domain' ? t(labels.domain) : t(labels.link)}
            width="2fr"
          >
            {(row: any) => {
              const value = type === 'domain' ? row.domain : row.url;
              return (
                <Text
                  weight="bold"
                  style={{ maxWidth: '500px' }}
                  title={value}
                  truncate
                >
                  <a
                    href={type === 'domain' ? `//${value}` : value}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {value}
                  </a>
                </Text>
              );
            }}
          </DataColumn>
          <DataColumn id="clicks" label={t(labels.outboundClicks)} width="120px">
            {(row: any) => <Text>{formatLongNumber(row.clicks)}</Text>}
          </DataColumn>
          <DataColumn id="visitors" label={t(labels.visitors)} width="120px">
            {(row: any) => <Text>{formatLongNumber(row.visitors)}</Text>}
          </DataColumn>
        </DataTable>
      </LoadingPanel>
    </Column>
  );
}
