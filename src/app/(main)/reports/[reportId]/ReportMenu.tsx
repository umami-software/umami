import styles from './ReportMenu.module.css';
import { useContext } from 'react';
import { ReportContext } from './Report';

export function ReportMenu({ children }) {
  const { report } = useContext(ReportContext);

  if (!report) {
    return null;
  }

  return <div className={styles.menu}>{children}</div>;
}

export default ReportMenu;
