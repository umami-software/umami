import { create } from 'zustand';
import { produce } from 'immer';
import { DateRange } from '@/lib/types';

const store = create(() => ({}));

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

export function setWebsiteDateCompare(websiteId: string, dateCompare: string) {
  store.setState(
    produce(state => {
      if (!state[websiteId]) {
        state[websiteId] = {};
      }

      state[websiteId].dateCompare = dateCompare;

      return state;
    }),
  );
}

export const useWebsites = store;
