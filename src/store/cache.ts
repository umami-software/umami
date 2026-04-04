import { create } from 'zustand';

const store = create(() => ({}));

export function setValue(key: string, value: any) {
  store.setState({ [key]: value });
}

export const useCache = store;
