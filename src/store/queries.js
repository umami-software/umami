import { create } from 'zustand';

const store = create(() => ({}));

export function saveQuery(key, data) {
  store.setState({ [key]: data });
}

export function getQuery(key) {
  return store.getState()[key];
}

export default store;
