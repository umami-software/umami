import type { ReactNode } from 'react';
import styles from './ClearData.module.css';

// Fixed-height step layout: content at the top, buttons pinned to the bottom.
// `start` holds buttons aligned left (e.g. Back), `children` of `actions` align right.
export function ClearDataFrame({
  children,
  start,
  actions,
}: {
  children: ReactNode;
  start?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.frame}>
      <div className={styles.content}>{children}</div>
      <div className={styles.footer}>
        {start}
        <div className={styles.footerEnd}>{actions}</div>
      </div>
    </div>
  );
}
