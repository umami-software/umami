'use client';
import { createContext, ReactNode } from 'react';
import { useReport } from 'components/hooks';
import styles from './Report.module.css';
import classNames from 'classnames';

export const ReportContext = createContext(null);

export interface ReportProps {
  reportId: string;
  defaultParameters: { [key: string]: any };
  children: ReactNode;
  className?: string;
}

export function Report({ reportId, defaultParameters, children, className }: ReportProps) {
  const report = useReport(reportId, defaultParameters);

  if (!report) {
    return null;
  }

  return (
    <ReportContext.Provider value={{ ...report }}>
      <div className={classNames(styles.container, className)}>{children}</div>
    </ReportContext.Provider>
  );
}

export default Report;
