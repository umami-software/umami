import { DataColumn, DataTable, type DataTableProps } from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import Link from '@/components/common/Link';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMessages } from '@/components/hooks';

const ALL_COLUMN_IDS = [
  'id',
  'visits',
  'views',
  'events',
  'location',
  'browser',
  'os',
  'device',
  'lastAt',
];

const ALL_COLUMNS: Record<string, { label: string; width: string; render: (row: any) => any }> = {
  id: {
    label: 'Session',
    width: '100px',
    render: (row: any) => <span>{row.id}</span>,
  },
  visits: {
    label: 'Visits',
    width: '80px',
    render: (row: any) => <span>{row.visits}</span>,
  },
  views: {
    label: 'Views',
    width: '80px',
    render: (row: any) => <span>{row.views}</span>,
  },
  events: {
    label: 'Events',
    width: '80px',
    render: (row: any) => <span>{row.events}</span>,
  },
  location: {
    label: 'Location',
    width: '200px',
    render: (row: any) => (
      <span>
        {row.country ? <span>{row.country}</span> : ''}
        {row.city ? `<span>, ${row.city}</span>` : ''}
      </span>
    ),
  },
  browser: {
    label: 'Browser',
    width: '140px',
    render: (row: any) => <span>{row.browser}</span>,
  },
  os: {
    label: 'OS',
    width: '140px',
    render: (row: any) => <span>{row.os}</span>,
  },
  device: {
    label: 'Device',
    width: '140px',
    render: (row: any) => <span>{row.device}</span>,
  },
  lastAt: {
    label: 'Last Seen',
    width: '140px',
    render: (row: any) => <span>{row.lastAt}</span>,
  },
};

export function SessionsTable({
  websiteId,
  getSessionHref,
  visibleColumns,
  ...props
}: DataTableProps & { websiteId: string; getSessionHref?: (row: any) => string; visibleColumns?: string[] }) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();

  const visibleColumnIds = visibleColumns ? visibleColumns.split(',') : ALL_COLUMN_IDS;
  // Filter saved order against registry, keeping their relative order
  const effectiveVisibleColumnIds = ALL_COLUMN_IDS.filter(id => visibleColumnIds.includes(id));
  const visibleColumnConfigs = effectiveVisibleColumnIds.reduce((acc, id) => {
    acc[id] = ALL_COLUMNS[id];
    return acc;
  }, {} as Record<string, { label: string; width: string; render: (row: any) => any }>);

  return (
    <DataTable {...props}>
      {Object.entries(visibleColumnConfigs).map(([id, config]) => (
        <DataColumn key={id} id={id} label={t(config.label)} width={config.width}>
          {(row: any) => <span>{config.render(row)}</span>}
        </DataColumn>
      ))}
    </DataTable>
  );
}