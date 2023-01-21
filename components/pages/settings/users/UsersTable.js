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
} from 'react-basics';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { Edit } from 'components/icons';
import styles from './UsersTable.module.css';

const columns = [
  { name: 'username', label: 'Username', style: { flex: 2 } },
  { name: 'role', label: 'Role', style: { flex: 2 } },
  { name: 'created', label: 'Created' },
  { name: 'action', label: ' ' },
];

export default function UsersTable({ data = [] }) {
  return (
    <Table className={styles.table} columns={columns} rows={data}>
      <TableHeader>
        {(column, index) => {
          return (
            <TableColumn key={index} className={styles.header} style={{ ...column.style }}>
              {column.label}
            </TableColumn>
          );
        }}
      </TableHeader>
      <TableBody>
        {(row, keys, rowIndex) => {
          row.created = formatDistance(new Date(row.createdAt), new Date(), {
            addSuffix: true,
          });

          row.action = (
            <div className={styles.actions}>
              <Link href={`/settings/users/${row.id}`}>
                <Button>
                  <Icon>
                    <Edit />
                  </Icon>
                  <Text>Edit</Text>
                </Button>
              </Link>
            </div>
          );

          return (
            <TableRow key={rowIndex} data={row} keys={keys}>
              {(data, key, colIndex) => {
                return (
                  <TableCell
                    key={colIndex}
                    className={styles.cell}
                    style={{ ...columns[colIndex]?.style }}
                  >
                    {data[key]}
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
