import { GridColumn, GridTable, useBreakpoint } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import { ROLES } from 'lib/constants';
import TeamMemberRemoveButton from './TeamMemberRemoveButton';

export function TeamMembersTable({
  data = [],
  teamId,
  readOnly,
}: {
  data: any[];
  teamId: string;
  readOnly: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();
  const breakpoint = useBreakpoint();

  const roles = {
    [ROLES.teamOwner]: formatMessage(labels.teamOwner),
    [ROLES.teamMember]: formatMessage(labels.teamMember),
  };

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="username" label={formatMessage(labels.username)} />
      <GridColumn name="role" label={formatMessage(labels.role)}>
        {row => roles[row?.teamUser?.[0]?.role]}
      </GridColumn>
      <GridColumn name="action" label=" " alignment="end">
        {row => {
          return (
            !readOnly &&
            row?.teamUser?.[0]?.role !== ROLES.teamOwner &&
            user?.id !== row?.id && <TeamMemberRemoveButton teamId={teamId} userId={row.id} />
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamMembersTable;
