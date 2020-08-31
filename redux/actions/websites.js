import { createSlice } from '@reduxjs/toolkit';
import produce from 'immer';

const websites = createSlice({
  name: 'user',
  initialState: {},
  reducers: {
    updateWebsites(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { updateWebsites } = websites.actions;

export default websites.reducer;

export function setDateRange(websiteId, dateRange) {
  return (dispatch, getState) => {
    const state = getState();
    let { websites = {} } = state;

    websites = produce(websites, draft => {
      if (!draft[websiteId]) {
        draft[websiteId] = {};
      }
      dateRange.modified = Date.now();
      draft[websiteId].dateRange = dateRange;
    });

    return dispatch(updateWebsites(websites));
  };
}
