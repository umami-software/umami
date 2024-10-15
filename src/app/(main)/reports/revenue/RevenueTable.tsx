import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import { useMessages } from 'components/hooks';
import { useContext } from 'react';
import { GridColumn, GridTable } from 'react-basics';
import { ReportContext } from '../[reportId]/Report';
import { formatLongCurrency } from 'lib/format';

export function RevenueTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { data } = report || {};

  if (!data) {
    return <EmptyPlaceholder />;
  }

  return (
    <GridTable data={data.table || []}>
      <GridColumn name="currency" label={formatMessage(labels.currency)} alignment="end">
        {row => row.currency}
      </GridColumn>
      <GridColumn name="currency" label={formatMessage(labels.total)} width="300px" alignment="end">
        {row => formatLongCurrency(row.sum, row.currency)}
      </GridColumn>
      <GridColumn name="currency" label={formatMessage(labels.average)} alignment="end">
        {row => formatLongCurrency(row.count ? row.sum / row.count : 0, row.currency)}
      </GridColumn>
      <GridColumn name="currency" label={formatMessage(labels.transactions)} alignment="end">
        {row => row.count}
      </GridColumn>
      <GridColumn name="currency" label={formatMessage(labels.uniqueCustomers)} alignment="end">
        {row => row.unique_count}
      </GridColumn>
    </GridTable>
  );
}

export default RevenueTable;
