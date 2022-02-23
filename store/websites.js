import create from 'zustand';
import produce from 'immer';

const store = create(() => ({}));

export function setDateRange(websiteId, dateRange) {
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
