import WebsitesTable from '@/app/(main)/settings/websites/WebsitesTable';
import DataTable from '@/components/common/DataTable';
import { useWebsites } from '@/components/hooks';

export function UserWebsites({ userId }) {
  const queryResult = useWebsites({ userId });

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => (
        <WebsitesTable data={data} showActions={true} allowEdit={true} allowView={true} />
      )}
    </DataTable>
  );
}

export default UserWebsites;
