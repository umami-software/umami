import { Button, DataColumn, DataTable, type DataTableProps, Icon } from '@umami/react-zen';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMessages, useNavigation } from '@/components/hooks';

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function ReplaysTable({ ...props }: DataTableProps) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { router, updateParams } = useNavigation();

  return (
    <DataTable {...props}>
      <DataColumn id="id" label={t(labels.session)} width="100px">
        {(row: any) => (
          <Link href={updateParams({ session: row.sessionId })}>
            <Avatar seed={row.sessionId} size={32} />
          </Link>
        )}
      </DataColumn>
      <DataColumn id="duration" label={t(labels.duration)} width="100px">
        {(row: any) => formatDuration(row.duration || 0)}
      </DataColumn>
      <DataColumn id="eventCount" label={t(labels.actions)} width="80px" />
      <DataColumn id="location" label={t(labels.location)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {row.city ? `${row.city}, ` : ''}
            {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="browser" label={t(labels.browser)} width="140px">
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="os" label={t(labels.os)} width="140px">
        {(row: any) => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={t(labels.device)} width="140px">
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="createdAt" label={t(labels.recordedAt)} width="140px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="play" label="" width="80px">
        {(row: any) => (
          <Button variant="quiet" onClick={() => router.push(updateParams({ replay: row.id }))}>
            <Icon>
              <Play />
            </Icon>
          </Button>
        )}
      </DataColumn>
    </DataTable>
  );
}
