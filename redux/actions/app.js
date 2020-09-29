import { createSlice } from '@reduxjs/toolkit';
import { get, getItem } from 'lib/web';
import { LOCALE_CONFIG, THEME_CONFIG } from 'lib/constants';

const app = createSlice({
  name: 'app',
  initialState: {
    locale: getItem(LOCALE_CONFIG) || 'en-US',
    theme: getItem(THEME_CONFIG) || 'light',
    versions: {
      current: process.env.VERSION,
      latest: null,
    },
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
    setVersions(state, action) {
      state.versions = action.payload;
      return state;
    },
  },
});

export const { setLocale, setTheme, setVersions } = app.actions;

export default app.reducer;

export function checkVersion() {
  return async (dispatch, getState) => {
    const {
      app: {
        versions: { current },
      },
    } = getState();

    const data = await get('https://api.github.com/repos/mikecao/umami/releases/latest');

    if (!data || !data['tag_name']) {
      return;
    }

    const latest = data['tag_name'].startsWith('v') ? data['tag_name'].slice(1) : data['tag_name'];

    if (latest === current) {
      return;
    }

    const latestArray = latest.split('.');
    const currentArray = current.split('.');

    for (let i = 0; i < 3; i++) {
      if (Number(latestArray[i]) > Number(currentArray[i])) {
        return dispatch(
          setVersions({
            current,
            latest: latest,
          }),
        );
      }
    }
  };
}
