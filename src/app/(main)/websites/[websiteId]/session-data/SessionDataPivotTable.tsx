'use client';
import { Column, DataColumn, DataTable, Row, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { Empty } from '@/components/common/Empty';
import Link from '@/components/common/Link';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Pager } from '@/components/common/Pager';
import {
  useMessages,
  useMobile,
  useNavigation,
  useSessionDataPivotQuery,
} from '@/components/hooks';
import type { PropertyFilter } from '@/lib/types';

export function SessionDataPivotTable({
  websiteId,
  propertyName,
  propertyKeys: providedPropertyKeys,
  propertyFilters = [],
}: {
  websiteId: string;
  propertyName: string;
  propertyKeys?: string[];
  propertyFilters?: PropertyFilter[];
}) {
  const { t, labels } = useMessages();
  const { router, updateParams } = useNavigation();
  const { isMobile } = useMobile();

  const pivotQuery = useSessionDataPivotQuery(websiteId, propertyName, propertyFilters);

  const propertyKeys = useMemo(() => {
    if (providedPropertyKeys) return providedPropertyKeys;
    return [];
  }, [providedPropertyKeys]);

  const tableMinWidth = useMemo(() => `${72 + 220 + 180 + propertyKeys.length * 160}px`, [propertyKeys.length]);

  const tableData = useMemo(() => {
    if (!pivotQuery.data?.data) return [];

    return pivotQuery.data.data.map(
      (row: {
        sessionId: string;
        distinctId: string;
        createdAt: string;
        propertyKeys: string[];
        propertyValues: string[];
      }) => {
        const flat: Record<string, any> = {
          sessionId: row.sessionId,
          distinctId: row.distinctId,
          createdAt: row.createdAt,
        };

        row.propertyKeys.forEach((key, i) => {
          flat[key] = row.propertyValues[i] ?? '';
        });

        return flat;
      },
    );
  }, [pivotQuery.data]);

  const tableQuery = useMemo(
    () => (pivotQuery.data ? { ...pivotQuery.data, data: tableData } : undefined),
    [pivotQuery.data, tableData],
  );

  const showPager = tableQuery && tableQuery.count > tableQuery.pageSize;

  const handlePageChange = (page: number) => {
    router.push(updateParams({ page }));
  };

  const renderTruncatedText = (value: string) => (
    <Row overflow="hidden" minWidth="0" width="100%">
      <Text truncate title={value} style={{ maxWidth: '100%' }}>
        {value}
      </Text>
    </Row>
  );

  const renderTable = (displayMode: 'cards' | 'table') => (
    <DataTable data={tableQuery?.data} style={{ width: '100%' }} displayMode={displayMode}>
      <DataColumn id="session" label={t(labels.session)} width="72px">
        {(row: any) => (
          <Link href={updateParams({ session: row.sessionId })}>
            <Avatar seed={row.sessionId} size={32} />
          </Link>
        )}
      </DataColumn>
      {propertyKeys.map(key => (
        <DataColumn key={key} id={key} label={key} width="160px">
          {(row: any) => renderTruncatedText(row[key] ?? '')}
        </DataColumn>
      ))}
      <DataColumn id="distinctId" label="Distinct ID" width="220px">
        {(row: any) => renderTruncatedText(row.distinctId || '')}
      </DataColumn>
      <DataColumn id="createdAt" label={t(labels.created)} width="180px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );

  return (
    <Column gap="4" minWidth="0" width="100%" maxWidth="100%">
      <LoadingPanel
        data={tableQuery?.data}
        isLoading={pivotQuery.isLoading}
        isFetching={pivotQuery.isFetching}
        error={pivotQuery.error}
        renderEmpty={() => <Empty />}
      >
        <Column gap="4" minWidth="0" width="100%" maxWidth="100%">
          {isMobile ? (
            renderTable('cards')
          ) : (
            <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
              <div style={{ width: tableMinWidth, minWidth: tableMinWidth }}>
                {renderTable('table')}
              </div>
            </div>
          )}
          {showPager && tableQuery && (
            <Row marginTop="6">
              <Pager
                page={tableQuery.page}
                pageSize={tableQuery.pageSize}
                count={tableQuery.count}
                onPageChange={handlePageChange}
              />
            </Row>
          )}
        </Column>
      </LoadingPanel>
    </Column>
  );
}
