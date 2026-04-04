import { WebsitesTable } from '@/app/(main)/websites/WebsitesTable';
import { DataGrid } from '@/components/common/DataGrid';
import { useUserWebsitesQuery } from '@/components/hooks';

export function UserWebsites({ userId }) {
  const queryResult = useUserWebsitesQuery({ userId });

  return (
    <DataGrid query={queryResult}>
      {({ data }) => (
        <WebsitesTable data={data} showActions={true} allowEdit={true} allowView={true} />
      )}
    </DataGrid>
  );
}
