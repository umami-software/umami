import { create } from 'zustand';

const store = create(() => ({}));

const useGlobalState = (key: string, value?: any) => {
  if (value !== undefined && store.getState()[key] === undefined) {
    store.setState({ [key]: value });
  }

  return [store(state => state[key]), (value: any) => store.setState({ [key]: value })];
};

export { useGlobalState };
