import { useContext } from 'react';
import { GridTable, GridColumn } from 'react-basics';
import { useMessages } from 'hooks';
import { ReportContext } from '../Report';

export function InsightsTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { fields = [] } = report?.parameters || {};

  return (
    <GridTable data={report?.data || []}>
      {fields.map(({ name }) => {
        return <GridColumn key={name} name={name} label={name} />;
      })}
      <GridColumn name="total" label={formatMessage(labels.total)} />
    </GridTable>
  );
}

export default InsightsTable;
