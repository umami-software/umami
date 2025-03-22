import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { useMessages } from '@/components/hooks';
import { useContext } from 'react';
import { DataColumn, DataTable } from '@umami/react-zen';
import { ReportContext } from '../[reportId]/Report';
import { formatLongCurrency } from '@/lib/format';

export function RevenueTable() {
  const { report } = useContext(ReportContext);
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
