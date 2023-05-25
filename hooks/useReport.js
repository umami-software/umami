import useStore, { createReport } from 'store/reports';
import { useCallback, useEffect, useState } from 'react';

export function useReport(reportId, defaultParameters) {
  const [id, setId] = useState(reportId);

  const selector = useCallback(state => state[id], [id]);
  const report = useStore(selector);

  useEffect(() => {
    if (!report) {
      const newReport = createReport(defaultParameters);
      setId(newReport.id);
    }
  }, []);

  return report;
}

export default useReport;
