import { DataGrid } from '@/components/common/DataGrid';
import { TeamsTable } from '@/app/(main)/settings/teams/TeamsTable';
import { useLoginQuery, useTeamsQuery } from '@/components/hooks';
import { ReactNode } from 'react';

export function TeamsDataTable({
  allowEdit,
  showActions,
  children,
}: {
  allowEdit?: boolean;
  showActions?: boolean;
  children?: ReactNode;
}) {
  const { user } = useLoginQuery();
  const queryResult = useTeamsQuery(user.id);

  return (
    <DataGrid queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => {
        return <TeamsTable data={data} allowEdit={allowEdit} showActions={showActions} />;
      }}
    </DataGrid>
  );
}
