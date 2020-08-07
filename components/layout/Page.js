import React from 'react';
import styles from './Page.module.css';

export default function Page({ children }) {
  return <div className={styles.container}>{children}</div>;
}
