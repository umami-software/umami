import { Text, DataTable, DataColumn } from '@umami/react-zen';
import { useMessages, useResultQuery, useFormat, useFields } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { formatShortTime } from '@/lib/format';

export interface BreakdownProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  selectedFields: string[];
}

export function Breakdown({ websiteId, selectedFields = [], startDate, endDate }: BreakdownProps) {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { fields } = useFields();
  const { data, error, isLoading } = useResultQuery<any>(
    'breakdown',
    {
      websiteId,
      startDate,
      endDate,
      fields: selectedFields,
    },
    { enabled: !!selectedFields.length },
  );

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <DataTable data={data}>
        {selectedFields.map(field => {
          return (
            <DataColumn key={field} id={field} label={fields.find(f => f.name === field)?.label}>
              {row => {
                const value = formatValue(row[field], field);
                return (
                  <Text truncate title={value}>
                    {value}
                  </Text>
                );
              }}
            </DataColumn>
          );
        })}
        <DataColumn id="visitors" label={formatMessage(labels.visitors)} align="end">
          {row => row?.['visitors']?.toLocaleString()}
        </DataColumn>
        <DataColumn id="visits" label={formatMessage(labels.visits)} align="end">
          {row => row?.['visits']?.toLocaleString()}
        </DataColumn>
        <DataColumn id="views" label={formatMessage(labels.views)} align="end">
          {row => row?.['views']?.toLocaleString()}
        </DataColumn>
        <DataColumn id="bounceRate" label={formatMessage(labels.bounceRate)} align="end">
          {row => {
            const n = (Math.min(row?.['visits'], row?.['bounces']) / row?.['visits']) * 100;
            return Math.round(+n) + '%';
          }}
        </DataColumn>
        <DataColumn id="visitDuration" label={formatMessage(labels.visitDuration)} align="end">
          {row => {
            const n = row?.['totaltime'] / row?.['visits'];
            return `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`;
          }}
        </DataColumn>
      </DataTable>
    </LoadingPanel>
  );
}
