import {
  Column,
  DataColumn,
  DataTable,
  Progress,
  Row,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useFunnelBreakdownQuery, useMessages } from '@/components/hooks';
import { BREAKDOWN_FIELDS } from '@/lib/constants';
import { formatLongNumber } from '@/lib/format';
import type { FunnelResult } from '@/queries/sql/funnels/getFunnel';
import { FunnelStepLabel } from './FunnelStepLabel';
import { formatPercent } from './format';

type BreakdownField = (typeof BREAKDOWN_FIELDS)[number];

// Visitors at each step split by a session attribute, with percentages in the funnel's mode.
export function FunnelBreakdown({
  websiteId,
  id,
  steps,
  mode,
}: {
  websiteId: string;
  id: string;
  steps: FunnelResult[];
  mode: 'first' | 'previous';
}) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const [field, setField] = useState<BreakdownField>('device');
  const { data, isLoading, error } = useFunnelBreakdownQuery({ websiteId, id, field });
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
            <SelectGroup>
              {fieldItems.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
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
            {steps.map((step, index) => (
              <DataColumn
                key={index}
                id={`step-${index}`}
                label={<FunnelStepLabel index={index} type={step.type} value={step.value} />}
              >
                {(row: any) => {
                  const visitors = row.visitors[index];
                  // Step 1 is the 100% baseline, faded so the eye goes to the steps that differ.
                  const isBaseline = index === 0;
                  const base = mode === 'first' ? row.visitors[0] : row.visitors[index - 1];
                  // 0 / 0 after an empty step is NaN, shown as 0%.
                  const ratio = isBaseline ? 1 : visitors / base || 0;

                  return (
                    <Column gap="1" width="100%" paddingRight="6">
                      <Row alignItems="baseline" justifyContent="space-between" gap="2">
                        <Text weight="bold">{formatPercent(ratio)}</Text>
                        <Text color="muted" title={String(visitors)}>
                          {formatLongNumber(visitors)}
                        </Text>
                      </Row>
                      {/* The baseline bar is always full, so fading the whole bar fades just its fill. */}
                      <Progress
                        value={ratio * 100}
                        min={0}
                        max={100}
                        style={isBaseline ? { opacity: 0.35 } : undefined}
                      />
                    </Column>
                  );
                }}
              </DataColumn>
            ))}
            <DataColumn id="conversion" label={t(labels.conversionRate)} width="140px">
              {(row: any) => (
                <Text weight="bold">
                  {formatPercent(row.visitors[row.visitors.length - 1] / row.visitors[0])}
                </Text>
              )}
            </DataColumn>
          </DataTable>
        )}
      </LoadingPanel>
    </Column>
  );
}
