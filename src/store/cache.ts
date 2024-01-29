import { create } from 'zustand';

const store = create(() => ({}));

export function setValue(key: string, value: any) {
  store.setState({ [key]: value });
}

export function touch(key: string) {
  setValue(key, Date.now());
}

export default store;
