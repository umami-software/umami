import create from 'zustand';

const store = create(() => ({}));

export function saveQuery(url, data) {
  store.setState({ [url]: data });
}

export default store;
