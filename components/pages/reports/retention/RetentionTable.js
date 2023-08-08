import { useContext } from 'react';
import { GridTable, GridColumn } from 'react-basics';
import { useMessages } from 'hooks';
import { ReportContext } from '../Report';

export function RetentionTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  return (
    <GridTable data={report?.data || []}>
      <GridColumn name="date" label={'Date'}>
        {row => row.date}
      </GridColumn>
      <GridColumn name="day" label={'Day'}>
        {row => row.day}
      </GridColumn>
      <GridColumn name="visitors" label={formatMessage(labels.visitors)}>
        {row => row.visitors}
      </GridColumn>
      <GridColumn name="returnVisitors" label={'Return Visitors'}>
        {row => row.returnVisitors}
      </GridColumn>
      <GridColumn name="percentage" label={'Percentage'}>
        {row => row.percentage}
      </GridColumn>
    </GridTable>
  );
}

export default RetentionTable;
