import { useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useNavigation, useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionsTable } from './SessionsTable';

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

export function SessionsDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useWebsiteSessionsQuery(websiteId);
  const { updateParams } = useNavigation();

  // Default to first 9 columns (without distinctId) so new columns are opt-in
  const defaultVisibleColumns = ALL_COLUMN_IDS.slice(0, -1);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleColumns);

  useEffect(() => {
    let stored: string | null;
    try {
      stored = typeof window !== 'undefined' ? localStorage.getItem('umami.sessions.columns') : null;
    } catch {
      stored = null;
    }
    if (stored) {
      let parsed: string[];
      try {
        parsed = JSON.parse(stored);
      } catch {
        parsed = [];
      }
      // Require an array of strings, fall back to defaults on error
      if (Array.isArray(parsed) && parsed.every((id: string) => ALL_COLUMN_IDS.includes(id))) {
        // Keep order from saved preference but only include valid columns
        const savedValid = ALL_COLUMN_IDS.filter(id => parsed.includes(id));
        if (savedValid.length > 0) {
          setVisibleColumns(savedValid);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Require at least one column visible
      const toSave = visibleColumns.length > 0 ? visibleColumns : defaultVisibleColumns;
      localStorage.setItem('umami.sessions.columns', JSON.stringify(toSave));
    }
  }, [visibleColumns]);

  return (
    <DataGrid
      query={queryResult}
      allowPaging
      allowSearch
      renderActions={() => (
        <ColumnPicker
          columns={Object.entries(ALL_COLUMNS).map(([id, config]) => ({
            id,
            label: config.label,
            width: config.width,
          }))}
          selectedColumns={visibleColumns}
          onColumnToggle={(id: string, checked: boolean) =>
            setVisibleColumns(
              // P2: Reject changes that remove the final column
              visibleColumns.length <= 1 && !checked
                ? visibleColumns
                : visibleColumns.includes(id)
                  ? visibleColumns.filter((cid: string) => cid !== id)
                  : [...visibleColumns, id],
            )
          }
        />
      )}
    >
      {({ data }) => (
        <SessionsTable
          data={data}
          websiteId={websiteId}
          getSessionHref={row => ({ session: row.id })}
          visibleColumns={visibleColumns.join(',')}
        />
      )}
    </DataGrid>
  );
}