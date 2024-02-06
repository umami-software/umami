import { useContext, useEffect, useState } from 'react';
import { GridTable, GridColumn } from 'react-basics';
import { useFormat, useMessages } from 'components/hooks';
import { ReportContext } from '../[reportId]/Report';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';

export function InsightsTable() {
  const [fields, setFields] = useState([]);
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();

  useEffect(
    () => {
      setFields(report?.parameters?.fields);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [report?.data],
  );

  if (!fields || !report?.parameters) {
    return <EmptyPlaceholder />;
  }

  return (
    <GridTable data={report?.data || []}>
      {fields.map(({ name, label }) => {
        return (
          <GridColumn key={name} name={name} label={label}>
            {row => formatValue(row[name], name)}
          </GridColumn>
        );
      })}
      <GridColumn
        name="visitors"
        label={formatMessage(labels.visitors)}
        width="100px"
        alignment="end"
      >
        {row => row?.visitors?.toLocaleString()}
      </GridColumn>
      <GridColumn name="views" label={formatMessage(labels.views)} width="100px" alignment="end">
        {row => row?.views?.toLocaleString()}
      </GridColumn>
    </GridTable>
  );
}

export default InsightsTable;
