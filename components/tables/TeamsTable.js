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
} from 'react-basics';
import styles from './TeamsTable.module.css';

export default function TeamsTable({ columns = [], rows = [] }) {
  return (
    <Table className={styles.table} columns={columns} rows={rows}>
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

          row.action = (
            <div className={styles.actions}>
              <Link href={`/teams/${id}`} shallow>
                <a>
                  <Button>
                    <Icon icon="arrow-right" />
                    Settings
                  </Button>
                </a>
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
