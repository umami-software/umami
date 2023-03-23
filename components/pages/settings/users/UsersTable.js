import {
  Button,
  Text,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Flexbox,
  Icons,
  ModalTrigger,
  Modal,
} from 'react-basics';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import useUser from 'hooks/useUser';
import UserDeleteForm from './UserDeleteForm';
import { ROLES } from 'lib/constants';
import useMessages from 'hooks/useMessages';

export default function UsersTable({ data = [], onDelete }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const columns = [
    { name: 'username', label: formatMessage(labels.username), style: { flex: 2 } },
    { name: 'role', label: formatMessage(labels.role), style: { flex: 1 } },
    { name: 'created', label: formatMessage(labels.created), style: { flex: 1 } },
    { name: 'action', label: ' ', style: { flex: 2 } },
  ];

  return (
    <Table columns={columns} rows={data}>
      <TableHeader>
        {(column, index) => {
          return (
            <TableColumn key={index} style={{ ...column.style }}>
              {column.label}
            </TableColumn>
          );
        }}
      </TableHeader>
      <TableBody>
        {(row, keys, rowIndex) => {
          const rowData = {
            ...row,
            created: formatDistance(new Date(row.createdAt), new Date(), {
              addSuffix: true,
            }),
            role: formatMessage(
              labels[Object.keys(ROLES).find(key => ROLES[key] === row.role) || labels.unknown],
            ),
            action: (
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
                  <Modal>
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
            ),
          };

          return (
            <TableRow key={rowIndex} data={rowData} keys={keys}>
              {(data, key, colIndex) => {
                return (
                  <TableCell key={colIndex} style={{ ...columns[colIndex]?.style }}>
                    <Flexbox
                      flex={1}
                      gap={10}
                      alignItems="center"
                      justifyContent={key === 'action' ? 'end' : undefined}
                    >
                      {data[key]}
                    </Flexbox>
                  </TableCell>
                );
              }}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
