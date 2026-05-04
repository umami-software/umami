import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages } from '@/components/hooks';
import { Pencil } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { BillingsDeleteButton } from './BillingsDeleteButton';
import { BillingsEditForm } from './BillingsEditForm';

export function BillingsTable(props: DataTableProps) {
  const { t, labels } = useMessages();

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={t(labels.name)} />
      <DataColumn id="provider" label={t(labels.provider)} />
      <DataColumn id="syncStatus" label={t(labels.syncStatus)} />
      <DataColumn id="lastRunAt" label={t(labels.lastRun)} width="200px">
        {(row: any) => (row.lastRunAt ? <DateDistance date={new Date(row.lastRunAt)} /> : '—')}
      </DataColumn>
      <DataColumn id="action" align="end" width="80px">
        {({ id, name, provider }: any) => (
          <Row>
            <DialogButton icon={<Pencil />} title={t(labels.edit)} variant="quiet" width="500px">
              {({ close }) => (
                <BillingsEditForm providerId={id} providerName={provider} displayName={name} onClose={close} />
              )}
            </DialogButton>
            <BillingsDeleteButton providerId={id} providerName={name ?? provider} />
          </Row>
        )}
      </DataColumn>
    </DataTable>
  );
}
