import { useMessages } from '@/components/hooks';
import { formatShortTime } from '@/lib/format';
import { DataColumn, DataTable } from '@umami/react-zen';
import { ReactNode } from 'react';

export interface ListExpandedTableProps {
  data?: any[];
  title?: string;
  renderLabel?: (row: any, index: number) => ReactNode;
}

export function ListExpandedTable({ data = [], title, renderLabel }: ListExpandedTableProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable data={data}>
      <DataColumn id="label" label={title} align="start" width="300px">
        {row =>
          renderLabel
            ? renderLabel({ x: row?.label, country: row?.['country'] }, Number(row.id))
            : (row.label ?? formatMessage(labels.unknown))
        }
      </DataColumn>
      <DataColumn id="visitors" label={formatMessage(labels.visitors)} align="end">
        {row => row?.['visitors']?.toLocaleString()}
      </DataColumn>
      <DataColumn id="visits" label={formatMessage(labels.visits)} align="end">
        {row => row?.['visits']?.toLocaleString()}
      </DataColumn>
      <DataColumn id="pageviews" label={formatMessage(labels.views)} align="end">
        {row => row?.['pageviews']?.toLocaleString()}
      </DataColumn>
      <DataColumn id="bounceRate" label={formatMessage(labels.bounceRate)} align="end">
        {row => {
          const n = (Math.min(row?.['visits'], row?.['bounces']) / row?.['visits']) * 100;
          return Math.round(+n) + '%';
        }}
      </DataColumn>
      <DataColumn id="visitDuration" label={formatMessage(labels.visitDuration)} align="end">
        {row => {
          const n = (row?.['totaltime'] / row?.['visits']) * 100;
          return `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`;
        }}
      </DataColumn>
    </DataTable>
  );
}
