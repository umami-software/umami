import { WebsitesTable } from '@/app/(main)/settings/websites/WebsitesTable';
import { DataGrid } from '@/components/common/DataGrid';
import { useWebsitesQuery } from '@/components/hooks';

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
