import { DataGrid } from '@/components/common/DataGrid';
import { useReplaysQuery } from '@/components/hooks';
import { ReplaysTable } from './ReplaysTable';

export function ReplaysDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useReplaysQuery(websiteId);

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => {
        return <ReplaysTable data={data} websiteId={websiteId} />;
      }}
    </DataGrid>
  );
}
