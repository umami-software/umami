import Link from 'next/link';
import { WebsitesTable } from './WebsitesTable';
import { DataGrid } from '@/components/common/DataGrid';
import { useNavigation, useUserWebsitesQuery } from '@/components/hooks';

export function WebsitesDataTable({
  teamId,
  allowEdit = true,
  allowView = true,
  showActions = true,
}: {
  teamId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
}) {
  const queryResult = useUserWebsitesQuery({ teamId });
  const { renderUrl } = useNavigation();

  const renderLink = (row: any) => (
    <Link href={renderUrl(`/websites/${row.id}`, false)}>{row.name}</Link>
  );

  return (
    <DataGrid query={queryResult} allowSearch allowPaging>
      {({ data }) => (
        <WebsitesTable
          data={data}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
          renderLink={renderLink}
        />
      )}
    </DataGrid>
  );
}
