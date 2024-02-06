import { GridColumn, GridTable, useBreakpoint } from 'react-basics';
import { useMessages, useLogin } from 'components/hooks';
import { ROLES } from 'lib/constants';
import TeamMemberRemoveButton from './TeamMemberRemoveButton';

export function TeamMembersTable({
  data = [],
  teamId,
  allowEdit,
}: {
  data: any[];
  teamId: string;
  allowEdit: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const breakpoint = useBreakpoint();

  const roles = {
    [ROLES.teamOwner]: formatMessage(labels.teamOwner),
    [ROLES.teamMember]: formatMessage(labels.teamMember),
  };

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
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
            user?.id !== row?.id && (
              <TeamMemberRemoveButton teamId={teamId} userId={row?.user?.id} />
            )
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamMembersTable;
