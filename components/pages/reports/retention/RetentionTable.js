import { useContext } from 'react';
import { GridTable, GridColumn } from 'react-basics';
import { useMessages } from 'hooks';
import { ReportContext } from '../Report';

export function RetentionTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { fields = [] } = report?.parameters || {};

  // return (
  //   <GridTable data={report?.data || []}>
  //     {fields.map(({ name }) => {
  //       return <GridColumn key={name} name={name} label={name} />;
  //     })}
  //     <GridColumn name="total" label={formatMessage(labels.total)} />
  //   </GridTable>
  // );
  return (
    <GridTable data={report?.data || []}>
      <GridColumn name="cohortDate">{row => row.cohortDate}</GridColumn>
      <GridColumn name="dateNumber">{row => row.date_number}</GridColumn>
      <GridColumn name="visitors" label={formatMessage(labels.visitors)}>
        {row => row.date_number}
      </GridColumn>
    </GridTable>
  );
}

export default RetentionTable;
