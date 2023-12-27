import { create } from 'zustand';

const store = create(() => ({}));

export function setValue(key, value) {
  store.setState({ [key]: value });
}

export default store;
