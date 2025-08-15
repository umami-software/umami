import { DataGrid } from '@/components/common/DataGrid';
import { TeamsTable } from './TeamsTable';
import { useLoginQuery, useUserTeamsQuery } from '@/components/hooks';
import { ReactNode } from 'react';

export function TeamsDataTable({
  allowEdit,
  showActions,
}: {
  allowEdit?: boolean;
  showActions?: boolean;
  children?: ReactNode;
}) {
  const { user } = useLoginQuery();
  const query = useUserTeamsQuery(user.id);

  return (
    <DataGrid query={query}>
      {({ data }) => {
        return <TeamsTable data={data} allowEdit={allowEdit} showActions={showActions} />;
      }}
    </DataGrid>
  );
}
