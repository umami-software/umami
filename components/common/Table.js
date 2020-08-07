import React from 'react';
import classNames from 'classnames';
import styles from './Table.module.css';

export default function Table({ columns, rows }) {
  return (
    <div className={styles.table}>
      <div className={styles.header}>
        {columns.map(({ key, label, header }) => (
          <div
            key={key}
            className={classNames(styles.head, header?.className)}
            style={header?.style}
          >
            {label}
          </div>
        ))}
      </div>
      <div className={styles.body}>
        {rows.map((row, rowIndex) => (
          <div className={styles.row} key={rowIndex}>
            {columns.map(({ key, render, cell }) => (
              <div
                key={`${rowIndex}${key}`}
                className={classNames(styles.cell, cell?.className)}
                style={cell?.style}
              >
                {render ? render(row) : row[key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
