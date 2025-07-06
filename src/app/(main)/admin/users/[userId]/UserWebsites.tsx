import { DataGrid } from '@/components/common/DataGrid';
import { useWebsitesQuery } from '@/components/hooks';
import { WebsitesTable } from '@/app/(main)/settings/websites/WebsitesTable';

export function UserWebsites({ userId }) {
  const queryResult = useWebsitesQuery({ userId });

  return (
    <DataGrid queryResult={queryResult}>
      {({ data }) => (
        <WebsitesTable data={data} showActions={true} allowEdit={true} allowView={true} />
      )}
    </DataGrid>
  );
}
