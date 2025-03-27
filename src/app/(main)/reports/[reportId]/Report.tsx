import { createContext, ReactNode } from 'react';
import { Loading, Grid } from '@umami/react-zen';
import { useReportQuery } from '@/components/hooks';

export const ReportContext = createContext(null);

export function Report({
  reportId,
  defaultParameters,
  children,
}: {
  reportId: string;
  defaultParameters: { type: string; parameters: { [key: string]: any } };
  children: ReactNode;
}) {
  const report = useReportQuery(reportId, defaultParameters);

  if (!report) {
    return reportId ? <Loading position="page" /> : null;
  }

  return (
    <ReportContext.Provider value={report}>
      <Grid rows="auto 1fr" columns="auto 1fr" gap="6">
        {children}
      </Grid>
    </ReportContext.Provider>
  );
}
