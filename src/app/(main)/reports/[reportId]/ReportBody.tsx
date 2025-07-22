import { useContext } from 'react';
import { ReportContext } from './Report';
import styles from './ReportBody.module.css';
import { DownloadButton } from '@/components/input/DownloadButton';

export function ReportBody({ children }) {
  const { report } = useContext(ReportContext);

  if (!report) {
    return null;
  }

  return (
    <div className={styles.body}>
      {report.type !== 'revenue' && report.type !== 'attribution' && (
        <DownloadButton filename={report.name} data={report.data} />
      )}
      {children}
    </div>
  );
}

export default ReportBody;
