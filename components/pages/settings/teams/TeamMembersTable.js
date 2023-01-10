import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Button,
  Icon,
} from 'react-basics';
import styles from './TeamsTable.module.css';

const columns = [
  { name: 'username', label: 'Username', style: { flex: 4 } },
  { name: 'role', label: 'Role' },
  { name: 'action', label: '' },
];

export default function TeamMembersTable({ data = [] }) {
  return (
    <Table className={styles.table} columns={columns} rows={data}>
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
          row.action = (
            <div className={styles.actions}>
              <Button>
                <Icon icon="cross" />
                Remove
              </Button>
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
                    {data[key] ?? data?.user?.[key]}
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
