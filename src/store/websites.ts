import { create } from 'zustand';
import { produce } from 'immer';
import { DateRange } from 'lib/types';

const store = create(() => ({}));

export function getWebsiteDateRange(websiteId: string) {
  return store.getState()?.[websiteId];
}

export function setWebsiteDateRange(websiteId: string, dateRange: DateRange) {
  store.setState(
    produce(state => {
      if (!state[websiteId]) {
        state[websiteId] = {};
      }

      state[websiteId].dateRange = { ...dateRange, modified: Date.now() };

      return state;
    }),
  );
}

export default store;
