import {
  Column,
  DataColumn,
  DataTable,
  Progress,
  Row,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useGoalBreakdownQuery, useMessages } from '@/components/hooks';
import { BREAKDOWN_FIELDS } from '@/lib/constants';
import { formatLongNumber } from '@/lib/format';
import { formatPercent } from '../funnels/format';

type BreakdownField = (typeof BREAKDOWN_FIELDS)[number];

// Visitors and goal conversion split by a session attribute.
export function GoalBreakdown({ websiteId, id }: { websiteId: string; id: string }) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const [field, setField] = useState<BreakdownField>('device');
  const { data, isLoading, error } = useGoalBreakdownQuery({ websiteId, id, field });
  const fieldLabels: Record<string, string> = {
    browser: t(labels.browser),
    os: t(labels.os),
    device: t(labels.device),
    country: t(labels.country),
  };
  const fieldItems = BREAKDOWN_FIELDS.map(name => ({ value: name, label: fieldLabels[name] }));

  return (
    <Column gap>
      <Row>
        <Select
          items={fieldItems}
          value={field}
          onValueChange={value => setField(value as BreakdownField)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {fieldItems.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <LoadingPanel data={data} isLoading={isLoading} error={error}>
        {data && (
          <DataTable data={data}>
            <DataColumn id="name" label={fieldLabels[field]} width="minmax(160px, 1fr)">
              {(row: any) => (
                <TypeIcon type={field} value={row.name}>
                  <Text truncate>
                    {row.name ? formatValue(row.name, field) : t(labels.unknown)}
                  </Text>
                </TypeIcon>
              )}
            </DataColumn>
            <DataColumn id="visitors" label={t(labels.visitors)} width="140px">
              {(row: any) => (
                <Text title={String(row.visitors)}>{formatLongNumber(row.visitors)}</Text>
              )}
            </DataColumn>
            <DataColumn id="conversion" label={t(labels.conversionRate)} width="minmax(200px, 2fr)">
              {(row: any) => {
                const ratio = row.visitors ? row.converted / row.visitors : 0;

                return (
                  <Column gap="1" width="100%" paddingRight="6">
                    <Row alignItems="baseline" justifyContent="space-between" gap="2">
                      <Text weight="bold">{formatPercent(ratio)}</Text>
                      <Text color="muted-foreground" title={String(row.converted)}>
                        {formatLongNumber(row.converted)}
                      </Text>
                    </Row>
                    <Progress value={ratio * 100} min={0} max={100} />
                  </Column>
                );
              }}
            </DataColumn>
          </DataTable>
        )}
      </LoadingPanel>
    </Column>
  );
}
