import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useMessages from 'hooks/useMessages';
import { useState } from 'react';
import {
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from 'react-basics';
import styles from './SettingsTable.module.css';
import Pager from 'components/common/Pager';

export function SettingsTable({
  columns = [],
  data,
  children,
  cellRender,
  showSearch,
  showPaging,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  filterValue,
}) {
  const { formatMessage, messages } = useMessages();
  const [filter, setFilter] = useState(filterValue);
  const { data: value, page, count, pageSize } = data;

  const handleFilterChange = value => {
    setFilter(value);
    onFilterChange(value);
  };

  return (
    <>
      {showSearch && (
        <SearchField
          onChange={handleFilterChange}
          delay={1000}
          value={filter}
          autoFocus={true}
          placeholder="Search"
          style={{ maxWidth: '300px', marginBottom: '10px' }}
        />
      )}
      {value.length === 0 && filterValue && (
        <EmptyPlaceholder message={formatMessage(messages.noResultsFound)}></EmptyPlaceholder>
      )}
      {value.length > 0 && (
        <Table columns={columns} rows={value}>
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
                      <TableCell
                        key={colIndex}
                        className={styles.cell}
                        style={columns[colIndex].style}
                      >
                        <label className={styles.label}>{columns[colIndex].label}</label>
                        {cellRender ? cellRender(row, data, key, colIndex) : data[key]}
                      </TableCell>
                    );
                  }}
                </TableRow>
              );
            }}
          </TableBody>
          {showPaging && (
            <Pager
              page={page}
              pageSize={pageSize}
              count={count}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </Table>
      )}
    </>
  );
}

export default SettingsTable;
