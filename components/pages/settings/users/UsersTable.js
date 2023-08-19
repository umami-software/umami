import { Button, Text, Icon, Icons, ModalTrigger, Modal } from 'react-basics';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import useUser from 'hooks/useUser';
import UserDeleteForm from './UserDeleteForm';
import { ROLES } from 'lib/constants';
import useMessages from 'hooks/useMessages';
import SettingsTable from 'components/common/SettingsTable';
import useLocale from 'hooks/useLocale';

export function UsersTable({
  data = { data: [] },
  onDelete,
  filterValue,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();
  const { dateLocale } = useLocale();

  const columns = [
    { name: 'username', label: formatMessage(labels.username) },
    { name: 'role', label: formatMessage(labels.role) },
    { name: 'created', label: formatMessage(labels.created) },
    { name: 'action', label: ' ' },
  ];

  const cellRender = (row, data, key) => {
    if (key === 'created') {
      return formatDistance(new Date(row.createdAt), new Date(), {
        addSuffix: true,
        locale: dateLocale,
      });
    }
    if (key === 'role') {
      return formatMessage(
        labels[Object.keys(ROLES).find(key => ROLES[key] === row.role)] || labels.unknown,
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
      {(row, keys, rowIndex) => {
        return (
          <>
            <Link href={`/settings/users/${row.id}`}>
              <Button>
                <Icon>
                  <Icons.Edit />
                </Icon>
                <Text>{formatMessage(labels.edit)}</Text>
              </Button>
            </Link>
            <ModalTrigger disabled={row.id === user.id}>
              <Button disabled={row.id === user.id}>
                <Icon>
                  <Icons.Trash />
                </Icon>
                <Text>{formatMessage(labels.delete)}</Text>
              </Button>
              <Modal title={formatMessage(labels.deleteUser)}>
                {close => (
                  <UserDeleteForm
                    userId={row.id}
                    username={row.username}
                    onSave={onDelete}
                    onClose={close}
                  />
                )}
              </Modal>
            </ModalTrigger>
          </>
        );
      }}
    </SettingsTable>
  );
}

export default UsersTable;
