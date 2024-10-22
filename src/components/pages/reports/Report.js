import { createContext } from 'react';
import Page from 'components/layout/Page';
import styles from './reports.module.css';
import { useReport } from 'components/hooks';

export const ReportContext = createContext(null);

export function Report({ reportId, defaultParameters, children, ...props }) {
  const report = useReport(reportId, defaultParameters);

  //console.log({ report });

  return (
    <ReportContext.Provider value={{ ...report }}>
      <Page {...props} className={styles.container}>
        {children}
      </Page>
    </ReportContext.Provider>
  );
}

export default Report;
