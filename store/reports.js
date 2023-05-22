import { create } from 'zustand';
import produce from 'immer';
import { getRandomChars } from 'next-basics';

const emptyReport = {
  name: 'Untitled',
  description: '',
  parameters: {},
};

const initialState = {};

const store = create(() => ({ ...initialState }));

export function updateReport(id, data) {
  const report = store.getState()[id];

  console.log('UPDATE STORE START', id, report);

  if (report) {
    store.setState(
      produce(state => {
        const item = state[id];
        const { parameters, ...rest } = data;

        if (parameters) {
          item.parameters = { ...item.parameters, ...parameters };
        }

        for (const key in rest) {
          item[key] = rest[key];
        }

        return state;
      }),
    );
  }
}

export function createReport() {
  const id = `new_${getRandomChars(16)}`;
  const report = { ...emptyReport, id };

  store.setState(
    produce(state => {
      state[id] = report;

      return state;
    }),
  );

  console.log('CREATE STORE', report);

  return report;
}

export default store;

if (typeof window !== 'undefined') {
  window.__STORE__ = store;
}
