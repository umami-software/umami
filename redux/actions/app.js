import { createSlice } from '@reduxjs/toolkit';
import { getItem } from 'lib/web';
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  LOCALE_CONFIG,
  THEME_CONFIG,
  VERSION_CHECK,
} from 'lib/constants';
import semver from 'semver';

const app = createSlice({
  name: 'app',
  initialState: {
    locale: getItem(LOCALE_CONFIG) || DEFAULT_LOCALE,
    theme: getItem(THEME_CONFIG) || DEFAULT_THEME,
    versions: {
      current: process.env.VERSION,
      latest: null,
      hasUpdate: false,
    },
    shareToken: null,
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
    setShareToken(state, action) {
      state.shareToken = action.payload;
      return state;
    },
  },
});

export const { setLocale, setTheme, setVersions, setShareToken } = app.actions;

export default app.reducer;

export function checkVersion() {
  return async (dispatch, getState) => {
    const {
      app: {
        versions: { current },
      },
    } = getState();

    const data = await fetch('https://api.github.com/repos/mikecao/umami/releases/latest', {
      method: 'get',
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    }).then(res => {
      if (res.ok) {
        return res.json();
      }

      return null;
    });

    if (!data) {
      return;
    }

    const { tag_name } = data;

    const latest = tag_name.startsWith('v') ? tag_name.slice(1) : tag_name;
    const lastCheck = getItem(VERSION_CHECK);
    const hasUpdate = latest && semver.gt(latest, current) && lastCheck?.version !== latest;

    return dispatch(
      setVersions({
        current,
        latest,
        hasUpdate,
      }),
    );
  };
}
