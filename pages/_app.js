import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { useStore } from 'redux/store';
import 'styles/variables.css';
import 'styles/bootstrap-grid.css';
import 'styles/index.css';

export default function App({ Component, pageProps }) {
  const store = useStore();

  return (
    <IntlProvider locale="en" defaultLocale="en">
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </IntlProvider>
  );
}
