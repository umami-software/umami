import create from 'zustand';
import produce from 'immer';
import semver from 'semver';
import { CURRENT_VERSION, VERSION_CHECK, UPDATES_URL } from 'lib/constants';
import { getItem } from 'next-basics';

const initialState = {
  current: CURRENT_VERSION,
  latest: null,
  hasUpdate: false,
  checked: false,
  releaseUrl: null,
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
      const { latest, url } = data;
      const lastCheck = getItem(VERSION_CHECK);

      const hasUpdate = !!(latest && lastCheck?.version !== latest && semver.gt(latest, current));

      state.current = current;
      state.latest = latest;
      state.hasUpdate = hasUpdate;
      state.checked = true;
      state.releaseUrl = url;

      return state;
    }),
  );
}

export default store;
