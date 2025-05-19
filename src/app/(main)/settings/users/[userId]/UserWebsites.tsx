import WebsitesTable from '@/app/(main)/settings/websites/WebsitesTable';
import DataTable from '@/components/common/DataTable';
import { useWebsites, useModified } from '@/components/hooks';

export function UserWebsites({ userId }) {
  const queryResult = useWebsites({ userId });
  const { touch } = useModified('websites');
  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => (
        <WebsitesTable
          data={data}
          showActions={true}
          allowEdit={true}
          allowView={true}
          updateChildren={() => {
            touch();
          }}
        />
      )}
    </DataTable>
  );
}

export default UserWebsites;
