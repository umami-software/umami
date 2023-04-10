import useMessages from 'hooks/useMessages';
import useUser from 'hooks/useUser';
import { ROLES } from 'lib/constants';
import {
  Flexbox,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from 'react-basics';
import TeamMemberRemoveButton from './TeamMemberRemoveButton';

export default function TeamMembersTable({ data = [], onSave, readOnly }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const columns = [
    { name: 'username', label: formatMessage(labels.username), style: { flex: 2 } },
    { name: 'role', label: formatMessage(labels.role), style: { flex: 1 } },
    { name: 'action', label: '', style: { flex: 1 } },
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
            username: row?.user?.username,
            role: formatMessage(
              labels[Object.keys(ROLES).find(key => ROLES[key] === row.role) || labels.unknown],
            ),
            action: !readOnly && (
              <Flexbox flex={1} justifyContent="end">
                <TeamMemberRemoveButton
                  teamId={row.teamId}
                  userId={row.userId}
                  disabled={user.id === row?.user?.id || row.role === ROLES.teamOwner}
                  onSave={onSave}
                ></TeamMemberRemoveButton>
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
