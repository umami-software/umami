import React from 'react';
import Head from 'next/head';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { useStore } from 'redux/store';
import useLocale from 'hooks/useLocale';
import useForceSSL from 'hooks/useForceSSL';
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
  useForceSSL(process.env.FORCE_SSL);
  const store = useStore();

  return (
    <Provider store={store}>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Intl>
        <Component {...pageProps} />
      </Intl>
    </Provider>
  );
}
