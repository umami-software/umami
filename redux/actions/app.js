import { createSlice } from '@reduxjs/toolkit';
import { getItem } from 'lib/web';

const app = createSlice({
  name: 'app',
  initialState: { locale: getItem('umami.locale') || 'en-US' },
  reducers: {
    updateApp(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { updateApp } = app.actions;

export default app.reducer;
