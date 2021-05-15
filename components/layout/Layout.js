import React from 'react';
import Head from 'next/head';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import useLocale from 'hooks/useLocale';

export default function Layout({ title, children, header = true, footer = true }) {
  const [locale] = useLocale();

  return (
    <>
      <Head>
        <title>umami{title && ` - ${title}`}</title>
      </Head>

      {header && <Header />}
      <main className="container" dir={locale === 'ar-SA' ? 'rtl' : 'ltr'}>
        {children}
      </main>
      {footer && <Footer />}
      <div id="__modals" />
    </>
  );
}
