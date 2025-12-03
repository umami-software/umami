import Link from 'next/link';
import { DataGrid } from '@/components/common/DataGrid';
import { useLoginQuery, useNavigation, useUserWebsitesQuery } from '@/components/hooks';
import { Favicon } from '@/index';
import { Icon, Row } from '@umami/react-zen';
import { WebsitesTable } from './WebsitesTable';

export function WebsitesDataTable({
  userId,
  teamId,
  allowEdit = true,
  allowView = true,
  showActions = true,
}: {
  userId?: string;
  teamId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
}) {
  const { user } = useLoginQuery();
  const queryResult = useUserWebsitesQuery({ userId: userId || user?.id, teamId });
  const { renderUrl } = useNavigation();

  const renderLink = (row: any) => (
    <Row alignItems="center" gap="3">
      <Icon size="md" color="muted">
        <Favicon domain={row.domain} />
      </Icon>
      <Link href={renderUrl(`/websites/${row.id}`, false)}>{row.name}</Link>
    </Row>
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
