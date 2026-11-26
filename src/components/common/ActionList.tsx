import { Column } from '@umami/react-zen';
import type { ReactNode } from 'react';
import styles from './ActionList.module.css';

export function ActionList({ children }: { children: ReactNode }) {
  return (
    <Column border borderRadius backgroundColor="card" className={styles.list}>
      {children}
    </Column>
  );
}
