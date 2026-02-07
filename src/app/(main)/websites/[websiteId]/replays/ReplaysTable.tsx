import { Button, DataColumn, DataTable, type DataTableProps, Icon } from '@umami/react-zen';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMessages } from '@/components/hooks';

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function ReplaysTable({ websiteId, ...props }: DataTableProps & { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();

  return (
    <DataTable {...props}>
      <DataColumn id="id" label={formatMessage(labels.session)} width="100px">
        {(row: any) => <Avatar seed={row.id} size={32} />}
      </DataColumn>
      <DataColumn id="duration" label={formatMessage(labels.duration)} width="100px">
        {(row: any) => formatDuration(row.duration || 0)}
      </DataColumn>
      <DataColumn id="eventCount" label={formatMessage(labels.events)} width="80px" />
      <DataColumn id="country" label={formatMessage(labels.country)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="browser" label={formatMessage(labels.browser)}>
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="os" label={formatMessage(labels.os)}>
        {(row: any) => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="createdAt" label={formatMessage(labels.recordedAt)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="play" label="" width="80px">
        {(row: any) => (
          <Link href={`/websites/${websiteId}/replays/${row.id}`}>
            <Button variant="quiet">
              <Icon>
                <Play />
              </Icon>
            </Button>
          </Link>
        )}
      </DataColumn>
    </DataTable>
  );
}
