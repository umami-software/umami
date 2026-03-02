import { DataColumn, DataTable } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { formatLongCurrency } from '@/lib/format';

export function RevenueTable({ data = [] }) {
  const { t, labels } = useMessages();

  return (
    <DataTable data={data}>
      <DataColumn id="currency" label={t(labels.currency)} align="end" />
      <DataColumn id="total" label={t(labels.total)} align="end">
        {(row: any) => formatLongCurrency(row.sum, row.currency)}
      </DataColumn>
      <DataColumn id="average" label={t(labels.average)} align="end">
        {(row: any) => formatLongCurrency(row.count ? row.sum / row.count : 0, row.currency)}
      </DataColumn>
      <DataColumn id="count" label={t(labels.transactions)} align="end" />
      <DataColumn id="unique_count" label={t(labels.uniqueCustomers)} align="end" />
    </DataTable>
  );
}
