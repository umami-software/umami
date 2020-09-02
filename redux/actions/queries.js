import { createSlice } from '@reduxjs/toolkit';

const queries = createSlice({
  name: 'queries',
  initialState: {},
  reducers: {
    updateQuery(state, action) {
      const { url, ...data } = action.payload;
      state[url] = data;
      return state;
    },
  },
});

export const { updateQuery } = queries.actions;

export default queries.reducer;
