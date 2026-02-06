import { DataGrid } from '@/components/common/DataGrid';
import { useRecordingsQuery } from '@/components/hooks';
import { RecordingsTable } from './RecordingsTable';

export function RecordingsDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useRecordingsQuery(websiteId);

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => {
        return <RecordingsTable data={data} websiteId={websiteId} />;
      }}
    </DataGrid>
  );
}
