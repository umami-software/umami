import React, { Children } from 'react';
import styles from './PageHeader.module.css';

export default function PageHeader({ children }) {
  const [firstChild, ...otherChildren] = Children.toArray(children);
  return (
    <div className={styles.header}>
      <div className={styles.title}> {firstChild}</div>
      {otherChildren && <div>{otherChildren}</div>}
    </div>
  );
}
