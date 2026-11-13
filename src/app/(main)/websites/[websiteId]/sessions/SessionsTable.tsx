import { DataColumn, DataTable, type DataTableProps } from '@umami/react-zen';
import { useMemo, type ReactNode } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import Link from '@/components/common/Link';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMessages } from '@/components/hooks';

export interface SessionColumnDef {
  label: string;
  width: string;
  render?: (row: any) => ReactNode;
}

export const SESSION_COLUMN_IDS = [
  'visits',
  'views',
  'events',
  'distinctId',
  'location',
  'browser',
  'os',
  'device',
  'hostname',
  'screen',
  'language',
  'region',
  'firstAt',
  'lastAt',
];

export const DEFAULT_SESSION_COLUMNS = [
  'visits',
  'views',
  'events',
  'location',
  'browser',
  'os',
  'device',
  'lastAt',
];

export function useSessionColumns(): Record<string, SessionColumnDef> {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();

  return useMemo(
    () => ({
      visits: { label: t(labels.visits), width: '80px' },
      views: { label: t(labels.views), width: '80px' },
      events: { label: t(labels.events), width: '80px' },
      distinctId: {
        label: t(labels.distinctId),
        width: '180px',
        render: (row: any) => row.distinctId || '—',
      },
      location: {
        label: t(labels.location),
        width: '200px',
        render: (row: any) => (
          <TypeIcon type="country" value={row.country}>
            {row.city ? `${row.city}, ` : ''}
            {formatValue(row.country, 'country')}
          </TypeIcon>
        ),
      },
      browser: {
        label: t(labels.browser),
        width: '140px',
        render: (row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        ),
      },
      os: {
        label: t(labels.os),
        width: '140px',
        render: (row: any) => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        ),
      },
      device: {
        label: t(labels.device),
        width: '140px',
        render: (row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        ),
      },
      hostname: { label: t(labels.hostname), width: '180px' },
      screen: { label: t(labels.screen), width: '120px' },
      language: { label: t(labels.language), width: '140px' },
      region: { label: t(labels.region), width: '140px' },
      firstAt: {
        label: t(labels.firstSeen),
        width: '140px',
        render: (row: any) => <DateDistance date={new Date(row.firstAt)} />,
      },
      lastAt: {
        label: t(labels.lastSeen),
        width: '140px',
        render: (row: any) => <DateDistance date={new Date(row.createdAt)} />,
      },
    }),
    [t, labels, formatValue],
  );
}

export function SessionsTable({
  websiteId,
  getSessionHref,
  visibleColumns,
  ...props
}: DataTableProps & {
  websiteId: string;
  getSessionHref?: (row: any) => string;
  visibleColumns?: string[];
}) {
  const { t, labels } = useMessages();
  const columns = useSessionColumns();
  const visible = (visibleColumns ?? DEFAULT_SESSION_COLUMNS).filter(id => columns[id]);

  return (
    <DataTable {...props}>
      <DataColumn id="id" label={t(labels.session)} width="100px">
        {(row: any) => (
          <Link
            href={
              getSessionHref ? getSessionHref(row) : `/websites/${websiteId}/sessions/${row.id}`
            }
            scroll={getSessionHref ? false : undefined}
          >
            <Avatar seed={row.id} size={32} />
          </Link>
        )}
      </DataColumn>
      {visible.map(id => (
        <DataColumn key={id} id={id} label={columns[id].label} width={columns[id].width}>
          {columns[id].render}
        </DataColumn>
      ))}
    </DataTable>
  );
}
