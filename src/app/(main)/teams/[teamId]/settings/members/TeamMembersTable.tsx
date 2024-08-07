import { GridColumn, GridTable } from 'react-basics';
import { useMessages, useLogin } from 'components/hooks';
import { ROLES } from 'lib/constants';
import TeamMemberRemoveButton from './TeamMemberRemoveButton';
import TeamMemberEditButton from './TeamMemberEditButton';

export function TeamMembersTable({
  data = [],
  teamId,
  allowEdit = false,
}: {
  data: any[];
  teamId: string;
  allowEdit: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();

  const roles = {
    [ROLES.teamOwner]: formatMessage(labels.teamOwner),
    [ROLES.teamManager]: formatMessage(labels.teamManager),
    [ROLES.teamMember]: formatMessage(labels.teamMember),
    [ROLES.teamViewOnly]: formatMessage(labels.viewOnly),
  };

  return (
    <GridTable data={data}>
      <GridColumn name="username" label={formatMessage(labels.username)}>
        {row => row?.user?.username}
      </GridColumn>
      <GridColumn name="role" label={formatMessage(labels.role)}>
        {row => roles[row?.role]}
      </GridColumn>
      <GridColumn name="action" label=" " alignment="end">
        {row => {
          return (
            allowEdit &&
            row?.role !== ROLES.teamOwner &&
            user?.id !== row?.user?.id && (
              <>
                <TeamMemberEditButton teamId={teamId} userId={row?.user?.id} role={row?.role} />
                <TeamMemberRemoveButton
                  teamId={teamId}
                  userId={row?.user?.id}
                  userName={row?.user?.username}
                />
              </>
            )
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamMembersTable;
