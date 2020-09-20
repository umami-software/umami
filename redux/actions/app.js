import { createSlice } from '@reduxjs/toolkit';
import { getItem } from 'lib/web';
import { LOCALE_CONFIG, THEME_CONFIG } from 'lib/constants';

const app = createSlice({
  name: 'app',
  initialState: {
    locale: getItem(LOCALE_CONFIG) || 'en-US',
    theme: getItem(THEME_CONFIG) || 'light',
  },
  reducers: {
    setLocale(state, action) {
      state.locale = action.payload;
      return state;
    },
    setTheme(state, action) {
      state.theme = action.payload;
      return state;
    },
  },
});

export const { setLocale, setTheme } = app.actions;

export default app.reducer;
