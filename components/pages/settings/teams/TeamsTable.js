import Link from 'next/link';
import {
  Button,
  Flexbox,
  Icon,
  Icons,
  Modal,
  ModalTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Text,
} from 'react-basics';
import TeamDeleteForm from './TeamDeleteForm';
import TeamLeaveForm from './TeamLeaveForm';
import useMessages from 'hooks/useMessages';
import useUser from 'hooks/useUser';
import { ROLES } from 'lib/constants';

export default function TeamsTable({ data = [], onDelete }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const columns = [
    { name: 'name', label: formatMessage(labels.name), style: { flex: 2 } },
    { name: 'owner', label: formatMessage(labels.owner) },
    { name: 'action', label: ' ' },
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
          const { id, teamUser } = row;
          const owner = row.teamUser.find(({ role }) => role === ROLES.teamOwner);
          const showDelete = user.id === owner?.userId;
          const teamUserId = teamUser.find(a => a.userId === user.id).id;

          const rowData = {
            ...row,
            owner: owner?.user?.username,
            action: (
              <Flexbox flex={1} gap={10} justifyContent="end">
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
                      <Icon>
                        <Icons.ArrowRight />
                      </Icon>
                      <Text>{formatMessage(labels.leave)}</Text>
                    </Button>
                    <Modal title={formatMessage(labels.leaveTeam)}>
                      {close => (
                        <TeamLeaveForm
                          teamUserId={teamUserId}
                          teamName={row.name}
                          onSave={onDelete}
                          onClose={close}
                        />
                      )}
                    </Modal>
                  </ModalTrigger>
                )}
              </Flexbox>
            ),
          };

          return (
            <TableRow key={rowIndex} data={rowData} keys={keys}>
              {(data, key, colIndex) => {
                return (
                  <TableCell key={colIndex} style={{ ...columns[colIndex]?.style }}>
                    <Flexbox flex={1} alignItems="center">
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
