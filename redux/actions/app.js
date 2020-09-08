import { createSlice } from '@reduxjs/toolkit';

const app = createSlice({
  name: 'app',
  initialState: { locale: 'en' },
  reducers: {
    updateApp(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { updateApp } = app.actions;

export default app.reducer;
