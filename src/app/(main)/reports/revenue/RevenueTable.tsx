import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { useMessages, useReport } from '@/components/hooks';
import { DataColumn, DataTable } from '@umami/react-zen';
import { formatLongCurrency } from '@/lib/format';

export function RevenueTable() {
  const { report } = useReport();
  const { formatMessage, labels } = useMessages();
  const { data } = report || {};

  if (!data) {
    return <EmptyPlaceholder />;
  }

  return (
    <DataTable data={data.table || []}>
      <DataColumn id="currency" label={formatMessage(labels.currency)} align="end">
        {(row: any) => row.currency}
      </DataColumn>
      <DataColumn id="currency" label={formatMessage(labels.total)} align="end">
        {(row: any) => formatLongCurrency(row.sum, row.currency)}
      </DataColumn>
      <DataColumn id="currency" label={formatMessage(labels.average)} align="end">
        {(row: any) => formatLongCurrency(row.count ? row.sum / row.count : 0, row.currency)}
      </DataColumn>
      <DataColumn id="currency" label={formatMessage(labels.transactions)} align="end">
        {(row: any) => row.count}
      </DataColumn>
      <DataColumn id="currency" label={formatMessage(labels.uniqueCustomers)} align="end">
        {(row: any) => row.unique_count}
      </DataColumn>
    </DataTable>
  );
}
