import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { useStore } from 'redux/store';
import useLocale from 'hooks/useLocale';
import { messages } from 'lib/lang';
import 'styles/variables.css';
import 'styles/bootstrap-grid.css';
import 'styles/index.css';

const Intl = ({ children }) => {
  const [locale] = useLocale();

  const Wrapper = ({ children }) => <span className={locale}>{children}</span>;

  return (
    <IntlProvider locale={locale} messages={messages[locale]} textComponent={Wrapper}>
      {children}
    </IntlProvider>
  );
};

export default function App({ Component, pageProps }) {
  const store = useStore();

  return (
    <Provider store={store}>
      <Intl>
        <Component {...pageProps} />
      </Intl>
    </Provider>
  );
}
