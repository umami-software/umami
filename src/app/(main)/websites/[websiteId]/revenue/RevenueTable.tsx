import { DataColumn, DataTable } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { formatLongCurrency } from '@/lib/format';

export function RevenueTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable data={data}>
      <DataColumn id="currency" label={formatMessage(labels.currency)} align="end" />
      <DataColumn id="total" label={formatMessage(labels.total)} align="end">
        {(row: any) => formatLongCurrency(row.sum, row.currency)}
      </DataColumn>
      <DataColumn id="average" label={formatMessage(labels.average)} align="end">
        {(row: any) => formatLongCurrency(row.count ? row.sum / row.count : 0, row.currency)}
      </DataColumn>
      <DataColumn id="count" label={formatMessage(labels.transactions)} align="end" />
      <DataColumn id="unique_count" label={formatMessage(labels.uniqueCustomers)} align="end" />
    </DataTable>
  );
}
