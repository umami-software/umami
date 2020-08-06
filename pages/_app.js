import React from 'react';
import { Provider } from 'react-redux';
import { useStore } from 'redux/store';
import 'styles/variables.css';
import 'styles/bootstrap-grid.css';
import 'styles/index.css';

export default function App({ Component, pageProps }) {
  const store = useStore();

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
