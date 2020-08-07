import React from 'react';
import styles from './Table.module.css';

export default function Table({ columns, rows }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map(({ key, label }) => (
            <th key={key}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map(({ key }) => (
              <td key={`${rowIndex}${key}`}>{row[key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
