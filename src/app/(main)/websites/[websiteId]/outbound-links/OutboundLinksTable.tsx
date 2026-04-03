'use client';
import { DataColumn, DataTable, type DataTableProps, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMessages, useNavigation } from '@/components/hooks';

export function OutboundLinksTable(props: DataTableProps) {
  const { t, labels } = useMessages();
  const { updateParams } = useNavigation();
  const { formatValue } = useFormat();

  return (
    <DataTable {...props}>
      <DataColumn id="outboundUrl" label={t(labels.outboundLink)} width="2fr">
        {(row: any) => {
          return (
            <Row alignItems="center" gap>
              <Text
                weight="bold"
                style={{ maxWidth: '400px' }}
                title={row.outboundUrl}
                truncate
              >
                <a href={row.outboundUrl} target="_blank" rel="noreferrer noopener">
                  {row.outboundUrl}
                </a>
              </Text>
            </Row>
          );
        }}
      </DataColumn>
      <DataColumn id="outboundDomain" label={t(labels.domain)} width="150px">
        {(row: any) => <Text truncate>{row.outboundDomain}</Text>}
      </DataColumn>
      <DataColumn id="urlPath" label={t(labels.page)} width="1fr">
        {(row: any) => (
          <Text style={{ maxWidth: '200px' }} title={row.urlPath} truncate>
            {row.urlPath}
          </Text>
        )}
      </DataColumn>
      <DataColumn id="session" label={t(labels.session)} width="80px">
        {(row: any) => {
          return (
            <Link href={updateParams({ session: row.sessionId })}>
              <Avatar seed={row.sessionId} size={32} />
            </Link>
          );
        }}
      </DataColumn>
      <DataColumn id="location" label={t(labels.location)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {row.city ? `${row.city}, ` : ''} {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="created" width="140px" label={t(labels.created)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
