import { useContext, useEffect, useState } from 'react';
import { DataTable, DataColumn } from '@umami/react-zen';
import { useFormat, useMessages } from '@/components/hooks';
import { ReportContext } from '../[reportId]/Report';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { formatShortTime } from '@/lib/format';

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
    <DataTable data={report?.data || []}>
      {fields.map(({ name, label }) => {
        return (
          <DataColumn key={name} id={name} label={label}>
            {row => formatValue(row[name], name)}
          </DataColumn>
        );
      })}
      <DataColumn id="views" label={formatMessage(labels.views)} align="end">
        {(row: any) => row?.views?.toLocaleString()}
      </DataColumn>
      <DataColumn id="visits" label={formatMessage(labels.visits)} align="end">
        {(row: any) => row?.visits?.toLocaleString()}
      </DataColumn>
      <DataColumn id="visitors" label={formatMessage(labels.visitors)} align="end">
        {(row: any) => row?.visitors?.toLocaleString()}
      </DataColumn>
      <DataColumn id="bounceRate" label={formatMessage(labels.bounceRate)} align="end">
        {(row: any) => {
          const n = (Math.min(row?.visits, row?.bounces) / row?.visits) * 100;
          return Math.round(+n) + '%';
        }}
      </DataColumn>
      <DataColumn id="visitDuration" label={formatMessage(labels.visitDuration)} align="end">
        {(row: any) => {
          const n = row?.totaltime / row?.visits;
          return `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`;
        }}
      </DataColumn>
    </DataTable>
  );
}
