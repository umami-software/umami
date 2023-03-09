import create from 'zustand';
import produce from 'immer';
import app from './app';
import { parseDateRange } from 'lib/date';

const store = create(() => ({}));

export function getWebsiteDateRange(websiteId) {
  return store.getState()?.[websiteId];
}

export function setWebsiteDateRange(websiteId, value) {
  store.setState(
    produce(state => {
      if (!state[websiteId]) {
        state[websiteId] = {};
      }

      let dateRange = value;

      if (typeof value === 'string') {
        const { locale } = app.getState();
        dateRange = parseDateRange(value, locale);
      }

      state[websiteId].dateRange = { ...dateRange, modified: Date.now() };

      return state;
    }),
  );
}

export default store;
