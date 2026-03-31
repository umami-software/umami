import { DataGrid } from '@/components/common/DataGrid';
import { useNavigation, useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionsTable } from './SessionsTable';

export function SessionsDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useWebsiteSessionsQuery(websiteId);
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => {
        return (
          <SessionsTable
            data={data}
            websiteId={websiteId}
            getSessionHref={isSharePage ? () => undefined : undefined}
          />
        );
      }}
    </DataGrid>
  );
}
