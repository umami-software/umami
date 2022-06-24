import create from 'zustand';
import produce from 'immer';
import semver from 'semver';
import { VERSION_CHECK } from 'lib/constants';
import { getItem } from 'lib/web';

const UPDATES_URL = 'https://api.umami.is/v1/updates';

const initialState = {
  current: process.env.currentVersion,
  latest: null,
  hasUpdate: false,
  checked: false,
};

const store = create(() => ({ ...initialState }));

export async function checkVersion() {
  const { current } = store.getState();

  const data = await fetch(`${UPDATES_URL}?v=${current}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
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

  store.setState(
    produce(state => {
      const { latest } = data;
      const lastCheck = getItem(VERSION_CHECK);

      const hasUpdate = !!(latest && lastCheck?.version !== latest && semver.gt(latest, current));

      state.current = current;
      state.latest = latest;
      state.hasUpdate = hasUpdate;
      state.checked = true;

      return state;
    }),
  );
}

export default store;
