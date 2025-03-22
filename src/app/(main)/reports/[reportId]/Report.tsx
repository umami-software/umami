import { createContext, ReactNode } from 'react';
import { Loading } from '@umami/react-zen';
import classNames from 'classnames';
import { useReportQuery } from '@/components/hooks';
import styles from './Report.module.css';

export const ReportContext = createContext(null);

export function Report({
  reportId,
  defaultParameters,
  children,
  className,
}: {
  reportId: string;
  defaultParameters: { type: string; parameters: { [key: string]: any } };
  children: ReactNode;
  className?: string;
}) {
  const report = useReportQuery(reportId, defaultParameters);

  if (!report) {
    return reportId ? <Loading position="page" /> : null;
  }

  return (
    <ReportContext.Provider value={report}>
      <div className={classNames(styles.container, className)}>{children}</div>
    </ReportContext.Provider>
  );
}
