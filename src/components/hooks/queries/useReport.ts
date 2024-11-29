import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../useApi';
import { useTimezone } from '../useTimezone';
import { useMessages } from '../useMessages';

export function useReport(
  reportId: string,
  defaultParameters?: { type: string; parameters: { [key: string]: any } },
) {
  const [report, setReport] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const { get, post } = useApi();
  const { timezone } = useTimezone();
  const { formatMessage, labels } = useMessages();

  const baseParameters = {
    name: formatMessage(labels.untitled),
    description: '',
    parameters: {},
  };

  const loadReport = async (id: string) => {
    const data: any = await get(`/reports/${id}`);

    const { dateRange } = data?.parameters || {};
    const { startDate, endDate } = dateRange || {};

    if (startDate && endDate) {
      dateRange.startDate = new Date(startDate);
      dateRange.endDate = new Date(endDate);
    }

    data.parameters = { ...defaultParameters?.parameters, ...data.parameters };

    setReport(data);
  };

  const runReport = useCallback(
    async (parameters: { [key: string]: any }) => {
      setIsRunning(true);

      const { type } = report;

      const data = await post(`/reports/${type}`, { ...parameters, timezone });

      setReport(
        produce((state: any) => {
          state.parameters = { ...defaultParameters?.parameters, ...parameters };
          state.data = data;

          return state;
        }),
      );

      setIsRunning(false);
    },
    [report, timezone],
  );

  const updateReport = useCallback(
    async (data: { [x: string]: any; parameters: any }) => {
      setReport(
        produce((state: any) => {
          const { parameters, ...rest } = data;

          if (parameters) {
            state.parameters = {
              ...defaultParameters?.parameters,
              ...state.parameters,
              ...parameters,
            };
          }

          for (const key in rest) {
            state[key] = rest[key];
          }

          return state;
        }),
      );
    },
    [report],
  );

  useEffect(() => {
    if (!reportId) {
      setReport({ ...baseParameters, ...defaultParameters });
    } else {
      loadReport(reportId);
    }
  }, [reportId]);

  return { report, runReport, updateReport, isRunning };
}

export default useReport;
