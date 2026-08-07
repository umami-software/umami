import { create } from 'zustand';

interface ReplaysStore {
  replays: any[];
}

const store = create<ReplaysStore>(() => ({
  replays: [],
}));

export function setReplays(replays: any[]) {
  store.setState({ replays });
}

export const useReplays = store;
