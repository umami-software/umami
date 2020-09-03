import { createSlice } from '@reduxjs/toolkit';

const websites = createSlice({
  name: 'websites',
  initialState: {},
  reducers: {
    updateWebsites(state, action) {
      state = action.payload;
      return state;
    },
    updateWebsite(state, action) {
      const { websiteId, ...data } = action.payload;
      state[websiteId] = data;
      return state;
    },
  },
});

export const { updateWebsites, updateWebsite } = websites.actions;

export default websites.reducer;

export function setDateRange(websiteId, dateRange) {
  return dispatch => {
    return dispatch(
      updateWebsite({ websiteId, dateRange: { ...dateRange, modified: Date.now() } }),
    );
  };
}
