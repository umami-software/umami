import { DataColumn, DataTable, type DataTableProps, Row, Text } from '@umami/react-zen';
import { DateDistance } from '@/components/common/DateDistance';
import Link from '@/components/common/Link';
import { useMessages } from '@/components/hooks';
import { Pencil } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { PaymentProvidersDeleteButton } from './PaymentProvidersDeleteButton';
import { PaymentProvidersEditForm } from './PaymentProvidersEditForm';

export function PaymentProvidersTable(props: DataTableProps) {
  const { t, labels } = useMessages();

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={t(labels.name)}>
        {(row: any) => (
          <Text truncate>
            <Link href={`/payment-providers/${row.id}`}>{row.name}</Link>
          </Text>
        )}
      </DataColumn>
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
                <PaymentProvidersEditForm
                  paymentProviderId={id}
                  providerName={provider}
                  displayName={name}
                  onClose={close}
                />
              )}
            </DialogButton>
            <PaymentProvidersDeleteButton paymentProviderId={id} providerName={name ?? provider} />
          </Row>
        )}
      </DataColumn>
    </DataTable>
  );
}
