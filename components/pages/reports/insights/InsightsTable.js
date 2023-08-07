import { useContext } from 'react';
import { GridTable, GridColumn } from 'react-basics';
import { useFormat, useMessages } from 'hooks';
import { ReportContext } from '../Report';

export function InsightsTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { groups = [] } = report?.parameters || {};
  const { formatValue } = useFormat();

  return (
    <GridTable data={report?.data || []}>
      {groups.map(({ name, label }) => {
        return (
          <GridColumn key={name} name={name} label={label}>
            {row => formatValue(row[name], name)}
          </GridColumn>
        );
      })}
      <GridColumn name="views" label={formatMessage(labels.views)} width="100px">
        {row => row.views.toLocaleString()}
      </GridColumn>
      <GridColumn name="visitors" label={formatMessage(labels.visitors)} width="100px">
        {row => row.visitors.toLocaleString()}
      </GridColumn>
    </GridTable>
  );
}

export default InsightsTable;
