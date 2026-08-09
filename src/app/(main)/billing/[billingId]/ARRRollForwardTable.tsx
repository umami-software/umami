'use client';
import { Column, DataColumn, DataTable, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import type { ARRMetrics } from '@/queries/sql/billing/getARR';
import { computeRollForward } from './arr';

export interface ARRRollForwardTableProps {
  data: ARRMetrics[];
  currency?: string;
}

const LABEL_COLUMN_WIDTH = 160;
const MONTH_COLUMN_WIDTH = 130;

interface RollForwardRowDef {
  id: string;
  label: string;
  get: (row: ReturnType<typeof computeRollForward>[number]) => number;
  emphasize?: boolean;
}

const ROW_DEFS: RollForwardRowDef[] = [
  { id: 'startingARR', label: 'Starting ARR', get: row => row.startingARR },
  { id: 'newSales', label: 'New Sales ARR', get: row => row.newSales },
  { id: 'expansion', label: 'Expansion ARR', get: row => row.expansion },
  { id: 'resurrected', label: 'Resurrected ARR', get: row => row.resurrected },
  { id: 'contraction', label: 'Contraction ARR', get: row => row.contraction },
  { id: 'churned', label: 'Churned ARR', get: row => row.churned },
  { id: 'endingARR', label: 'Ending ARR', get: row => row.endingARR, emphasize: true },
];

export function ARRRollForwardTable({ data, currency = 'USD' }: ARRRollForwardTableProps) {
  const rollForward = useMemo(() => computeRollForward(data), [data]);

  const tableData = useMemo(
    () =>
      ROW_DEFS.map(def => {
        const row: Record<string, any> = { id: def.id, label: def.label, emphasize: def.emphasize };
        rollForward.forEach(monthRow => {
          row[monthRow.month] = def.get(monthRow);
        });
        return row;
      }),
    [rollForward],
  );

  const tableMinWidth = LABEL_COLUMN_WIDTH + rollForward.length * MONTH_COLUMN_WIDTH;

  if (!rollForward.length) {
    return null;
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      <div style={{ width: `${tableMinWidth}px`, minWidth: `${tableMinWidth}px` }}>
        <DataTable data={tableData} style={{ width: '100%' }} displayMode="table">
          <DataColumn
            id="label"
            label=""
            width={`${LABEL_COLUMN_WIDTH}px`}
            className="bg-surface-base"
            style={{ position: 'sticky', left: 0, zIndex: 1 }}
          >
            {(row: any) => <Text weight={row.emphasize ? 'bold' : undefined}>{row.label}</Text>}
          </DataColumn>
          {rollForward.map(monthRow => (
            <DataColumn
              key={monthRow.month}
              id={monthRow.month}
              label={formatDate(`${monthRow.month}-01`, 'MMM yyyy')}
              align="end"
              width={`${MONTH_COLUMN_WIDTH}px`}
            >
              {(row: any) => (
                <Column
                  alignItems="flex-end"
                  {...(row.id === 'endingARR'
                    ? { border: true, borderRadius: true, paddingX: '2' }
                    : {})}
                >
                  <Text
                    weight={row.emphasize ? 'bold' : undefined}
                    color={row[monthRow.month] < 0 ? 'red' : undefined}
                  >
                    {formatCurrency(row[monthRow.month], currency)}
                  </Text>
                </Column>
              )}
            </DataColumn>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
