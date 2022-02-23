import create from 'zustand';
import produce from 'immer';
import semver from 'semver';
import { VERSION_CHECK } from 'lib/constants';
import { getItem } from 'lib/web';

const REPO_URL = 'https://api.github.com/repos/mikecao/umami/releases/latest';

const initialState = {
  current: process.env.VERSION,
  latest: null,
  hasUpdate: false,
};

const store = create(() => ({ ...initialState }));

export async function checkVersion() {
  const { current } = store.getState();

  const data = await fetch(REPO_URL, {
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

  store.setState(
    produce(state => {
      const { tag_name } = data;

      const latest = tag_name.startsWith('v') ? tag_name.slice(1) : tag_name;
      const lastCheck = getItem(VERSION_CHECK);
      const hasUpdate = latest && semver.gt(latest, current) && lastCheck?.version !== latest;

      state.current = current;
      state.latest = latest;
      state.hasUpdate = hasUpdate;

      return state;
    }),
  );
}

export default store;
