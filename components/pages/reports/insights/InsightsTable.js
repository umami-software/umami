import { useContext } from 'react';
import { GridTable, GridColumn } from 'react-basics';
import { useMessages } from 'hooks';
import { ReportContext } from '../Report';

export function InsightsTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { groups = [] } = report?.parameters || {};

  return (
    <GridTable data={report?.data || []}>
      {groups.map(({ name, label }) => {
        return <GridColumn key={name} name={name} label={label} />;
      })}
      <GridColumn name="views" label={formatMessage(labels.views)} width="100px" />
      <GridColumn name="visitors" label={formatMessage(labels.visitors)} width="100px" />
    </GridTable>
  );
}

export default InsightsTable;
