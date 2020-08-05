import { createSlice } from '@reduxjs/toolkit';

const user = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    updateUser(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { updateUser } = user.actions;

export default user.reducer;
