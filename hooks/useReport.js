import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
import useApi from './useApi';

const baseParameters = {
  name: 'Untitled',
  description: '',
  parameters: {},
};

export function useReport(reportId, defaultParameters) {
  const [report, setReport] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const { get, post } = useApi();

  const loadReport = async id => {
    const data = await get(`/reports/${id}`);

    setReport(data);
  };

  const runReport = useCallback(
    async parameters => {
      setIsRunning(true);

      const { type } = report;

      const data = await post(`/reports/${type}`, parameters);

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
