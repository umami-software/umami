import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
import { useTimezone } from './useTimezone';
import useApi from './useApi';
import useMessages from './useMessages';

export function useReport(reportId, defaultParameters) {
  const [report, setReport] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const { get, post } = useApi();
  const [timezone] = useTimezone();
  const { formatMessage, labels } = useMessages();

  const baseParameters = {
    name: formatMessage(labels.untitled),
    description: '',
    parameters: {},
  };

  const loadReport = async id => {
    const data = await get(`/reports/${id}`);

    const { dateRange } = data?.parameters || {};
    const { startDate, endDate } = dateRange || {};

    if (startDate && endDate) {
      dateRange.startDate = new Date(startDate);
      dateRange.endDate = new Date(endDate);
    }

    setReport(data);
  };

  const runReport = useCallback(
    async parameters => {
      setIsRunning(true);

      const { type } = report;

      const data = await post(`/reports/${type}`, { ...parameters, timezone });

      setReport(
        produce(state => {
          state.parameters = parameters;
          state.data = data;

          return state;
        }),
      );

      setIsRunning(false);
    },
    [report],
  );

  const updateReport = useCallback(
    async data => {
      setReport(
        produce(state => {
          const { parameters, ...rest } = data;

          if (parameters) {
            state.parameters = { ...state.parameters, ...parameters };
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
  }, []);

  return { report, runReport, updateReport, isRunning };
}

export default useReport;
