import DataTable from 'components/common/DataTable';
import TeamsTable from 'app/(main)/settings/teams/TeamsTable';
import { useLogin, useTeams } from 'components/hooks';
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
  const { user } = useLogin();
  const queryResult = useTeams(user.id);

  return (
    <DataTable queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => {
        return <TeamsTable data={data} allowEdit={allowEdit} showActions={showActions} />;
      }}
    </DataTable>
  );
}

export default TeamsDataTable;
