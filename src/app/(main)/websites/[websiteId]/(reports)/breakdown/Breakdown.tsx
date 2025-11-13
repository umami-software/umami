import { Text, DataTable, DataColumn, Column } from '@umami/react-zen';
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
      <Column overflow="auto" minHeight="0" height="100%">
        <DataTable data={data} style={{ tableLayout: 'fixed' }}>
          {selectedFields.map(field => {
            return (
              <DataColumn
                key={field}
                id={field}
                label={fields.find(f => f.name === field)?.label}
                width="minmax(120px, 1fr)"
              >
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
          <DataColumn
            id="visitors"
            label={formatMessage(labels.visitors)}
            align="end"
            width="120px"
          >
            {row => row?.['visitors']?.toLocaleString()}
          </DataColumn>
          <DataColumn id="visits" label={formatMessage(labels.visits)} align="end" width="120px">
            {row => row?.['visits']?.toLocaleString()}
          </DataColumn>
          <DataColumn id="views" label={formatMessage(labels.views)} align="end" width="120px">
            {row => row?.['views']?.toLocaleString()}
          </DataColumn>
          <DataColumn
            id="bounceRate"
            label={formatMessage(labels.bounceRate)}
            align="end"
            width="120px"
          >
            {row => {
              const n = (Math.min(row?.['visits'], row?.['bounces']) / row?.['visits']) * 100;
              return Math.round(+n) + '%';
            }}
          </DataColumn>
          <DataColumn
            id="visitDuration"
            label={formatMessage(labels.visitDuration)}
            align="end"
            width="120px"
          >
            {row => {
              const n = row?.['totaltime'] / row?.['visits'];
              return `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`;
            }}
          </DataColumn>
        </DataTable>
      </Column>
    </LoadingPanel>
  );
}
