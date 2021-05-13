import React from 'react';
import Head from 'next/head';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import { useIntl } from 'react-intl';

export default function Layout({ title, children, header = true, footer = true }) {
  const intl = useIntl();

  return (
    <>
      <Head dir={intl.formatMessage({ id: 'metrics.dir', defaultMessage: 'ltr' })}>
        <title>umami{title && ` - ${title}`}</title>
      </Head>

      {header && <Header />}
      <main
        className="container"
        dir={intl.formatMessage({ id: 'metrics.dir', defaultMessage: 'ltr' })}
      >
        {children}
      </main>
      {footer && <Footer />}
      <div id="__modals" />
    </>
  );
}
