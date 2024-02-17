import DataTable from 'components/common/DataTable';
import TeamsTable from 'app/(main)/settings/teams/TeamsTable';
import { useLogin, useTeams } from 'components/hooks';

export function TeamsDataTable({
  allowEdit,
  showActions,
}: {
  allowEdit?: boolean;
  showActions?: boolean;
}) {
  const { user } = useLogin();
  const queryResult = useTeams(user.id);

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => {
        return <TeamsTable data={data} allowEdit={allowEdit} showActions={showActions} />;
      }}
    </DataTable>
  );
}

export default TeamsDataTable;
