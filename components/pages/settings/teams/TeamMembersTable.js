import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  LoadingButton,
  Icon,
  Icons,
  Flexbox,
  Text,
} from 'react-basics';
import { ROLES } from 'lib/constants';
import useUser from 'hooks/useUser';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';
import { useState } from 'react';

export default function TeamMembersTable({ data = [], onSave, readOnly }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();
  const { del, useMutation } = useApi();
  const { mutate, isLoading } = useMutation(data => del(`/teamUsers/${data.teamUserId}`));
  const [loadingIds, setLoadingIds] = useState([]);

  const columns = [
    { name: 'username', label: formatMessage(labels.username), style: { flex: 2 } },
    { name: 'role', label: formatMessage(labels.role), style: { flex: 1 } },
    { name: 'action', label: '', style: { flex: 1 } },
  ];

  const handleRemoveTeamMember = teamUserId => {
    setLoadingIds(prev => [...prev, teamUserId]);

    mutate(
      { teamUserId },
      {
        onSuccess: () => {
          setLoadingIds(loadingIds.filter(a => a !== teamUserId));
          onSave();
        },
        onError: () => {
          setLoadingIds(loadingIds.filter(a => a !== teamUserId));
        },
      },
    );
  };

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
                <LoadingButton
                  onClick={() => handleRemoveTeamMember(row.id)}
                  disabled={user.id === row?.user?.id || row.role === ROLES.teamOwner}
                  loading={isLoading && loadingIds.some(a => a === row.id)}
                >
                  <Icon>
                    <Icons.Close />
                  </Icon>
                  <Text>{formatMessage(labels.remove)}</Text>
                </LoadingButton>
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
