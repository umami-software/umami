import { ColumnPicker } from '@/components/common/ColumnPicker';
import { DataGrid } from '@/components/common/DataGrid';
import { useColumnSelection, useNavigation, useWebsiteSessionsQuery } from '@/components/hooks';
import {
  DEFAULT_SESSION_COLUMNS,
  SESSION_COLUMN_IDS,
  SessionsTable,
  useSessionColumns,
} from './SessionsTable';

const STORAGE_KEY = 'umami.sessions.columns';

export function SessionsDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useWebsiteSessionsQuery(websiteId);
  const { updateParams } = useNavigation();
  const columns = useSessionColumns();
  const { visible, toggle, reset } = useColumnSelection(
    STORAGE_KEY,
    SESSION_COLUMN_IDS,
    DEFAULT_SESSION_COLUMNS,
  );

  const options = SESSION_COLUMN_IDS.map(id => ({ id, label: columns[id].label }));

  return (
    <DataGrid
      query={queryResult}
      allowPaging
      allowSearch
      renderActions={() => (
        <ColumnPicker options={options} visible={visible} onToggle={toggle} onReset={reset} />
      )}
    >
      {({ data }) => (
        <SessionsTable
          data={data}
          websiteId={websiteId}
          visibleColumns={visible}
          getSessionHref={row => updateParams({ session: row.id })}
        />
      )}
    </DataGrid>
  );
}
