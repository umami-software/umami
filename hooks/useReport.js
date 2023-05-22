import useStore, { createReport } from 'store/reports';
import { useCallback, useEffect, useState } from 'react';
import { useForceUpdate } from 'hooks';

export function useReport(reportId) {
  const [id, setId] = useState(reportId);

  const selector = useCallback(state => state[id], [id]);
  const report = useStore(selector);

  useEffect(() => {
    if (!report) {
      setId(createReport().id);
    }
  }, []);

  console.log('USE REPORT', report);

  return report;
}

export default useReport;
