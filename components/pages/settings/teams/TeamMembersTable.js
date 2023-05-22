import useMessages from 'hooks/useMessages';
import useUser from 'hooks/useUser';
import { ROLES } from 'lib/constants';
import TeamMemberRemoveButton from './TeamMemberRemoveButton';
import SettingsTable from 'components/common/SettingsTable';

export function TeamMembersTable({ data = [], onSave, readOnly }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const columns = [
    { name: 'username', label: formatMessage(labels.username) },
    { name: 'role', label: formatMessage(labels.role) },
    { name: 'action', label: ' ' },
  ];

  const cellRender = (row, data, key) => {
    if (key === 'username') {
      return row?.user?.username;
    }
    if (key === 'role') {
      return formatMessage(
        labels[Object.keys(ROLES).find(key => ROLES[key] === row.role) || labels.unknown],
      );
    }
    return data[key];
  };

  return (
    <SettingsTable data={data} columns={columns} cellRender={cellRender}>
      {row => {
        return (
          !readOnly && (
            <TeamMemberRemoveButton
              teamId={row.teamId}
              userId={row.userId}
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
