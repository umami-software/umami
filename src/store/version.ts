import semver from 'semver';
import { create } from 'zustand';
import { CURRENT_VERSION, UPDATES_URL, VERSION_CHECK } from '@/lib/constants';
import { getItem } from '@/lib/storage';

const initialState = {
  current: CURRENT_VERSION,
  latest: null,
  hasUpdate: false,
  checked: false,
  releaseUrl: null,
};

const store = create(() => ({ ...initialState }));

export async function getVersionUpdate(current = CURRENT_VERSION) {
  if (!semver.valid(current)) {
    return null;
  }

  try {
    const response = await fetch(`${UPDATES_URL}?v=${encodeURIComponent(current)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const latest = semver.valid(data?.latest);

    if (!latest) {
      return null;
    }

    return {
      latest,
      hasUpdate: semver.gt(latest, current),
      releaseUrl: typeof data.url === 'string' ? data.url : null,
    };
  } catch {
    return null;
  }
}

export async function checkVersion() {
  const { current } = store.getState();
  const result = await getVersionUpdate(current);

  if (!result) {
    return;
  }

  const lastCheck = getItem(VERSION_CHECK);
  store.setState({
    ...result,
    hasUpdate: result.hasUpdate && lastCheck?.version !== result.latest,
    checked: true,
  });
}

export const useVersion = store;
