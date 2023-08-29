import SettingsTable from 'components/common/SettingsTable';
import useLocale from 'components/hooks/useLocale';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import { ROLES } from 'lib/constants';
import Link from 'next/link';
import { Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import TeamDeleteForm from './TeamDeleteForm';
import TeamLeaveForm from './TeamLeaveForm';

export function TeamsTable({
  data = { data: [] },
  onDelete,
  filterValue,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();
  const { dir } = useLocale();

  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'owner', label: formatMessage(labels.owner) },
    { name: 'action', label: ' ' },
  ];

  const cellRender = (row, data, key) => {
    if (key === 'owner') {
      return row.teamUser.find(({ role }) => role === ROLES.teamOwner)?.user?.username;
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
        const { id, teamUser } = row;
        const owner = teamUser.find(({ role }) => role === ROLES.teamOwner);
        const showDelete = user.id === owner?.userId;

        return (
          <>
            <Link href={`/settings/teams/${id}`}>
              <Button>
                <Icon>
                  <Icons.Show />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </Button>
            </Link>
            {showDelete && (
              <ModalTrigger>
                <Button>
                  <Icon>
                    <Icons.Trash />
                  </Icon>
                  <Text>{formatMessage(labels.delete)}</Text>
                </Button>
                <Modal title={formatMessage(labels.deleteTeam)}>
                  {close => (
                    <TeamDeleteForm
                      teamId={row.id}
                      teamName={row.name}
                      onSave={onDelete}
                      onClose={close}
                    />
                  )}
                </Modal>
              </ModalTrigger>
            )}
            {!showDelete && (
              <ModalTrigger>
                <Button>
                  <Icon rotate={dir === 'rtl' ? 180 : 0}>
                    <Icons.ArrowRight />
                  </Icon>
                  <Text>{formatMessage(labels.leave)}</Text>
                </Button>
                <Modal title={formatMessage(labels.leaveTeam)}>
                  {close => (
                    <TeamLeaveForm
                      teamId={id}
                      userId={user.id}
                      teamName={row.name}
                      onSave={onDelete}
                      onClose={close}
                    />
                  )}
                </Modal>
              </ModalTrigger>
            )}
          </>
        );
      }}
    </SettingsTable>
  );
}

export default TeamsTable;
