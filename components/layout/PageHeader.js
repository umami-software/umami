import React from 'react';
import styles from './PageHeader.module.css';

export default function PageHeader({ children }) {
  return <div className={styles.header}>{children}</div>;
}
