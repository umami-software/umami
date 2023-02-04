import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Button,
  Icon,
  Flexbox,
  Icons,
  Text,
  ModalTrigger,
  Modal,
} from 'react-basics';
import { useIntl } from 'react-intl';
import { labels } from 'components/messages';
import { ROLES } from 'lib/constants';
import TeamDeleteForm from './TeamDeleteForm';

export default function TeamsTable({ data = [], onDelete }) {
  const { formatMessage } = useIntl();

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
          const { id } = row;

          const rowData = {
            ...row,
            owner: row.teamUser.find(({ role }) => role === ROLES.teamOwner)?.user?.username,
            action: (
              <Flexbox flex={1} gap={10} justifyContent="end">
                <Link href={`/settings/teams/${id}`}>
                  <a>
                    <Button>
                      <Icon>
                        <Icons.Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Button>
                  </a>
                </Link>
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
