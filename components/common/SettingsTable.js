import { Table, TableHeader, TableBody, TableRow, TableCell, TableColumn } from 'react-basics';
import styles from './SettingsTable.module.css';

export function SettingsTable({ columns = [], data = [], children, cellRender }) {
  return (
    <Table columns={columns} rows={data}>
      <TableHeader className={styles.header}>
        {(column, index) => {
          return (
            <TableColumn key={index} className={styles.cell} style={columns[index].style}>
              {column.label}
            </TableColumn>
          );
        }}
      </TableHeader>
      <TableBody className={styles.body}>
        {(row, keys, rowIndex) => {
          row.action = children(row, keys, rowIndex);

          return (
            <TableRow key={rowIndex} data={row} keys={keys} className={styles.row}>
              {(data, key, colIndex) => {
                return (
                  <TableCell key={colIndex} className={styles.cell} style={columns[colIndex].style}>
                    <label className={styles.label}>{columns[colIndex].label}</label>
                    {cellRender ? cellRender(row, data, key, colIndex) : data[key]}
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

export default SettingsTable;
