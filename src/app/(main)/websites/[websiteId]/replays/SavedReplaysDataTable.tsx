import { DataGrid } from '@/components/common/DataGrid';
import { useSavedReplaysQuery } from '@/components/hooks';
import { SavedReplaysTable } from './SavedReplaysTable';

export function SavedReplaysDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useSavedReplaysQuery(websiteId);

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => {
        return <SavedReplaysTable data={data} />;
      }}
    </DataGrid>
  );
}
