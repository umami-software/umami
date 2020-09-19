import { createSlice } from '@reduxjs/toolkit';
import { getItem } from 'lib/web';
import { LOCALE_CONFIG } from 'lib/constants';

const app = createSlice({
  name: 'app',
  initialState: { locale: getItem(LOCALE_CONFIG) || 'en-US' },
  reducers: {
    updateApp(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { updateApp } = app.actions;

export default app.reducer;
