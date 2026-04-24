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
          <Column minWidth="0" width="100%" maxWidth="100%" overflow={isMobile ? undefined : 'hidden'}>
            <DataTable data={tableQuery?.data} style={{ width: '100%' }} displayMode={isMobile ? 'cards' : 'table'}>
              <DataColumn id="session" label={t(labels.session)} width="0.75fr">
                {(row: any) => (
                  <Link href={updateParams({ session: row.sessionId })}>
                    <Avatar seed={row.sessionId} size={32} />
                  </Link>
                )}
              </DataColumn>
              <DataColumn id="urlPath" label={t(labels.path)} width="1.4fr">
                {(row: any) => (
                  <Text truncate title={row.urlPath}>
                    {row.urlPath}
                  </Text>
                )}
              </DataColumn>
              {propertyKeys.map(key => (
                <DataColumn key={key} id={key} label={key} width="1fr">
                  {(row: any) => (
                    <Text truncate title={row[key]}>
                      {row[key] ?? ''}
                    </Text>
                  )}
                </DataColumn>
              ))}
              <DataColumn id="createdAt" label={t(labels.created)} width="1.1fr">
                {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
              </DataColumn>
            </DataTable>
          </Column>
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
