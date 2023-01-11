import { useQuery } from '@tanstack/react-query';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import { formatDistance } from 'date-fns';
import useApi from 'hooks/useApi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Button,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from 'react-basics';
import styles from './UsersTable.module.css';

const defaultColumns = [
  { name: 'username', label: 'Username', style: { flex: 2 } },
  { name: 'role', label: 'Role', style: { flex: 2 } },
  { name: 'created', label: 'Created' },
  { name: 'action', label: ' ' },
];

export default function UsersTable({ columns = defaultColumns, onLoading, onAddKeyClick }) {
  const [values, setValues] = useState(null);
  const { get } = useApi();
  const { data, isLoading, error } = useQuery(['user'], () => get(`/users`));
  const hasData = data && data.length !== 0;

  useEffect(() => {
    if (data) {
      setValues(data);
      onLoading({ data, isLoading, error });
    }
  }, [onLoading, data, isLoading, error]);

  return (
    <>
      {hasData && (
        <Table className={styles.table} columns={columns} rows={values}>
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
                      <Icon icon="arrow-right" />
                      Settings
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
      )}
      {!hasData && (
        <EmptyPlaceholder className={styles.empty} msg="You don't have any Users.">
          <Button variant="primary" onClick={onAddKeyClick}>
            <Icon icon="plus" /> Create User
          </Button>
        </EmptyPlaceholder>
      )}
    </>
  );
}
