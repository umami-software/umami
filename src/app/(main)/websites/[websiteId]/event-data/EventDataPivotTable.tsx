'use client';
import { Column, DataColumn, DataTable, Row, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { Empty } from '@/components/common/Empty';
import Link from '@/components/common/Link';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Pager } from '@/components/common/Pager';
import { useEventDataPivotQuery, useEventDataPropertiesQuery, useMessages, useMobile, useNavigation } from '@/components/hooks';
import type { EventPropertyFilter } from '@/lib/types';

export function EventDataPivotTable({
  websiteId,
  eventName,
  eventFilters = [],
}: {
  websiteId: string;
  eventName: string;
  eventFilters?: EventPropertyFilter[];
}) {
  const { t, labels } = useMessages();
  const { router, updateParams } = useNavigation();
  const { isMobile } = useMobile();

  const propertiesQuery = useEventDataPropertiesQuery(websiteId);
  const pivotQuery = useEventDataPivotQuery(websiteId, eventName, eventFilters);

  const propertyKeys = useMemo(() => {
    if (!propertiesQuery.data || !eventName) return [];
    const keys = propertiesQuery.data
      .filter((e: { eventName: string }) => e.eventName === eventName)
      .map((e: { propertyName: string }) => e.propertyName);
    return [...new Set<string>(keys)];
  }, [propertiesQuery.data, eventName]);

  const tableMinWidth = useMemo(() => {
    return `${72 + 220 + 180 + propertyKeys.length * 160}px`;
  }, [propertyKeys.length]);

  const tableData = useMemo(() => {
    if (!pivotQuery.data?.data) return [];
    return pivotQuery.data.data.map(
      (row: { eventId: string; sessionId: string; eventName: string; urlPath: string; createdAt: string; propertyKeys: string[]; propertyValues: string[] }) => {
        const flat: Record<string, any> = {
          eventId: row.eventId,
          sessionId: row.sessionId,
          urlPath: row.urlPath,
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
    () =>
      pivotQuery.data
        ? { ...pivotQuery.data, data: tableData }
        : undefined,
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
            <DataTable data={tableQuery?.data} style={{ width: '100%' }} displayMode="cards">
              <DataColumn id="session" label={t(labels.session)} width="72px">
                {(row: any) => (
                  <Link href={updateParams({ session: row.sessionId })}>
                    <Avatar seed={row.sessionId} size={32} />
                  </Link>
                )}
              </DataColumn>
              <DataColumn id="urlPath" label={t(labels.path)} width="220px">
                {(row: any) => renderTruncatedText(row.urlPath ?? '')}
              </DataColumn>
              {propertyKeys.map(key => (
                <DataColumn key={key} id={key} label={key} width="160px">
                  {(row: any) => renderTruncatedText(row[key] ?? '')}
                </DataColumn>
              ))}
              <DataColumn id="createdAt" label={t(labels.created)} width="180px">
                {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
              </DataColumn>
            </DataTable>
          ) : (
            <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
              <div style={{ width: tableMinWidth, minWidth: tableMinWidth }}>
                <DataTable
                  data={tableQuery?.data}
                  style={{ width: '100%' }}
                  displayMode="table"
                >
                  <DataColumn id="session" label={t(labels.session)} width="72px">
                    {(row: any) => (
                      <Link href={updateParams({ session: row.sessionId })}>
                        <Avatar seed={row.sessionId} size={32} />
                      </Link>
                    )}
                  </DataColumn>
                  <DataColumn id="urlPath" label={t(labels.path)} width="220px">
                    {(row: any) => renderTruncatedText(row.urlPath ?? '')}
                  </DataColumn>
                  {propertyKeys.map(key => (
                    <DataColumn key={key} id={key} label={key} width="160px">
                      {(row: any) => renderTruncatedText(row[key] ?? '')}
                    </DataColumn>
                  ))}
                  <DataColumn id="createdAt" label={t(labels.created)} width="180px">
                    {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
                  </DataColumn>
                </DataTable>
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
