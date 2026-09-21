import { create } from 'zustand';

export type ReplaySource = 'replays' | 'saved';

interface ReplaysStore {
  websiteId?: string;
  source?: ReplaySource;
  replays: any[];
}

const store = create<ReplaysStore>(() => ({
  replays: [],
}));

export function setReplays(websiteId: string, source: ReplaySource, replays: any[]) {
  store.setState({ websiteId, source, replays });
}

export function clearReplays(websiteId: string, source: ReplaySource) {
  const state = store.getState();

  if (state.websiteId === websiteId && state.source === source) {
    store.setState({ websiteId: undefined, source: undefined, replays: [] });
  }
}

export const useReplays = store;
