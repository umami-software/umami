import { Column, DataColumn, DataTable, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useBreakdownQuery, useFields, useFormat, useMessages } from '@/components/hooks';
import { formatLongCurrency, formatShortTime } from '@/lib/format';

export interface BreakdownProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  selectedFields: string[];
  /** Adds orders and revenue of completed payments in this currency. */
  currency?: string;
}

export function Breakdown({
  websiteId,
  selectedFields = [],
  startDate,
  endDate,
  currency,
}: BreakdownProps) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { fields } = useFields();
  const { data, error, isLoading } = useBreakdownQuery(
    {
      websiteId,
      startDate,
      endDate,
      fields: selectedFields,
      currency,
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
          <DataColumn id="visitors" label={t(labels.visitors)} align="end" width="120px">
            {row => row?.visitors?.toLocaleString()}
          </DataColumn>
          <DataColumn id="visits" label={t(labels.visits)} align="end" width="120px">
            {row => row?.visits?.toLocaleString()}
          </DataColumn>
          <DataColumn id="views" label={t(labels.views)} align="end" width="120px">
            {row => row?.views?.toLocaleString()}
          </DataColumn>
          <DataColumn id="bounceRate" label={t(labels.bounceRate)} align="end" width="120px">
            {row => {
              const n = (Math.min(row?.visits, row?.bounces) / row?.visits) * 100;
              return `${Math.round(+n)}%`;
            }}
          </DataColumn>
          {currency && (
            <DataColumn id="orders" label={t('commerce.orders')} align="end" width="100px">
              {row => Number(row?.orders || 0).toLocaleString()}
            </DataColumn>
          )}
          {currency && (
            <DataColumn id="revenue" label={t('commerce.revenue')} align="end" width="130px">
              {row => formatLongCurrency(Number(row?.revenue || 0), currency)}
            </DataColumn>
          )}
          <DataColumn id="visitDuration" label={t(labels.visitDuration)} align="end" width="120px">
            {row => {
              const n = row?.totaltime / row?.visits;
              return `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`;
            }}
          </DataColumn>
        </DataTable>
      </Column>
    </LoadingPanel>
  );
}
