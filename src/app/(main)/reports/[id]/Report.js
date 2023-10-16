'use client';
import { createContext } from 'react';
import { useReport } from 'components/hooks';
import styles from './Report.module.css';

export const ReportContext = createContext(null);

export function Report({ reportId, defaultParameters, children, ...props }) {
  const report = useReport(reportId, defaultParameters);

  if (!report) {
    return null;
  }

  return (
    <ReportContext.Provider value={{ ...report }}>
      <div {...props} className={styles.container}>
        {children}
      </div>
    </ReportContext.Provider>
  );
}

export default Report;
