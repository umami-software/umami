import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import { ROLES } from 'lib/constants';
import TeamMemberRemoveButton from './TeamMemberRemoveButton';
import SettingsTable from 'components/common/SettingsTable';

export function TeamMembersTable({
  data = [],
  teamId,
  onSave,
  readOnly,
  filterValue,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const columns = [
    { name: 'username', label: formatMessage(labels.username) },
    { name: 'role', label: formatMessage(labels.role) },
    { name: 'action', label: ' ' },
  ];

  const cellRender = (row, data, key) => {
    if (key === 'username') {
      return row?.username;
    }
    if (key === 'role') {
      return formatMessage(
        labels[
          Object.keys(ROLES).find(key => ROLES[key] === row?.teamUser[0]?.role) || labels.unknown
        ],
      );
    }
    return data[key];
  };

  return (
    <SettingsTable
      data={data}
      columns={columns}
      cellRender={cellRender}
      showSearch={true}
      showPaging={true}
      onFilterChange={onFilterChange}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      filterValue={filterValue}
    >
      {row => {
        return (
          !readOnly && (
            <TeamMemberRemoveButton
              teamId={teamId}
              userId={row.id}
              disabled={user.id === row?.user?.id || row.role === ROLES.teamOwner}
              onSave={onSave}
            />
          )
        );
      }}
    </SettingsTable>
  );
}

export default TeamMembersTable;
