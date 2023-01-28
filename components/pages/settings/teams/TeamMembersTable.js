import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Button,
  Icon,
  Icons,
  Flexbox,
  Text,
} from 'react-basics';
import { useIntl } from 'react-intl';
import { ROLES } from 'lib/constants';
import { labels } from 'components/messages';

export default function TeamMembersTable({ data = [] }) {
  const { formatMessage } = useIntl();

  const columns = [
    { name: 'username', label: formatMessage(labels.username), style: { flex: 4 } },
    { name: 'role', label: formatMessage(labels.role) },
    { name: 'action', label: '' },
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
            action: (
              <div>
                <Button>
                  <Icon>
                    <Icons.Close />
                  </Icon>
                  <Text>{formatMessage(labels.remove)}</Text>
                </Button>
              </div>
            ),
          };

          return (
            <TableRow key={rowIndex} data={rowData} keys={keys}>
              {(data, key, colIndex) => {
                return (
                  <TableCell key={colIndex} style={{ ...columns[colIndex]?.style }}>
                    <Flexbox
                      flex={1}
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
