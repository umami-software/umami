import styles from './ReportBody.module.css';
import { useContext } from 'react';
import { ReportContext } from './Report';

export function ReportBody({ children }) {
  const { report } = useContext(ReportContext);

  if (!report) {
    return null;
  }

  return <div className={styles.body}>{children}</div>;
}

export default ReportBody;
