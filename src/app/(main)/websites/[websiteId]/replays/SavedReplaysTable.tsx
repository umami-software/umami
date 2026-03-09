import { Button, DataColumn, DataTable, type DataTableProps, Icon } from '@umami/react-zen';
import { Play } from 'lucide-react';
import { useMessages, useNavigation } from '@/components/hooks';

export function SavedReplaysTable({ ...props }: DataTableProps) {
  const { t, labels } = useMessages();
  const { router, updateParams } = useNavigation();

  return (
    <DataTable {...props}>
      <DataColumn id="play" label="" width="80px">
        {(row: any) => (
          <Button
            variant="quiet"
            onClick={() => router.push(updateParams({ replay: row.visitId }))}
          >
            <Icon>
              <Play />
            </Icon>
          </Button>
        )}
      </DataColumn>
      <DataColumn id="name" label={t(labels.name)} />
      <DataColumn id="visitId" label={t(labels.replayId)} />
      <DataColumn id="createdAt" label={t(labels.created)} width="160px">
        {(row: any) => new Date(row.createdAt).toLocaleString()}
      </DataColumn>
    </DataTable>
  );
}
