import { Button, DataColumn, DataTable, type DataTableProps, Icon } from '@umami/react-zen';
import { Play } from 'lucide-react';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages } from '@/components/hooks';

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function SessionReplaysTable({
  onPlay,
  selectedId,
  ...props
}: DataTableProps & { onPlay: (id: string) => void; selectedId?: string }) {
  const { t, labels } = useMessages();

  return (
    <DataTable {...props}>
      <DataColumn id="play" label="" width="80px">
        {(row: any) => (
          <Button
            variant={row.id === selectedId ? 'primary' : 'quiet'}
            onClick={() => onPlay(row.id)}
          >
            <Icon>
              <Play />
            </Icon>
          </Button>
        )}
      </DataColumn>
      <DataColumn id="id" label={t(labels.replayId)} />
      <DataColumn id="duration" label={t(labels.duration)} width="100px">
        {(row: any) => formatDuration(row.duration || 0)}
      </DataColumn>
      <DataColumn id="eventCount" label={t(labels.actions)} width="80px" />
      <DataColumn id="createdAt" label={t(labels.recordedAt)} width="140px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
