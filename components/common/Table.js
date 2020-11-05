import React from 'react';
import classNames from 'classnames';
import NoData from 'components/common/NoData';
import styles from './Table.module.css';

export default function Table({
  columns,
  rows,
  empty,
  className,
  bodyClassName,
  rowKey,
  showHeader = true,
  children,
}) {
  if (empty && rows.length === 0) {
    return empty;
  }

  return (
    <div className={classNames(styles.table, className)}>
      {showHeader && (
        <div className={classNames(styles.header, 'row')}>
          {columns.map(({ key, label, className, style, header }) => (
            <div
              key={key}
              className={classNames(styles.head, className, header?.className)}
              style={{ ...style, ...header?.style }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
      <div className={classNames(styles.body, bodyClassName)}>
        {rows.length === 0 && <NoData />}
        {!children &&
          rows.map((row, index) => {
            const id = rowKey ? rowKey(row) : index;
            return <TableRow key={id} columns={columns} row={row} />;
          })}
        {children}
      </div>
    </div>
  );
}

export const TableRow = ({ columns, row }) => (
  <div className={classNames(styles.row, 'row')}>
    {columns.map(({ key, render, className, style, cell }, index) => (
      <div
        key={`${key}-${index}`}
        className={classNames(styles.cell, className, cell?.className)}
        style={{ ...style, ...cell?.style }}
      >
        {render ? render(row) : row[key]}
      </div>
    ))}
  </div>
);
