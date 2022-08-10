import create from 'zustand';
import produce from 'immer';
import app from './app';
import { getDateRange } from '../lib/date';

const store = create(() => ({}));

export function setDateRange(websiteId, value) {
  store.setState(
    produce(state => {
      if (!state[websiteId]) {
        state[websiteId] = {};
      }

      let dateRange = value;

      if (typeof value === 'string') {
        const { locale } = app.getState();
        dateRange = getDateRange(value, locale);
      }

      state[websiteId].dateRange = { ...dateRange, modified: Date.now() };

      return state;
    }),
  );
}

export default store;
