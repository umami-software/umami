import React from 'react';
import Head from 'next/head';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';

export default function Layout({ title, children, header = true, footer = true }) {
  return (
    <>
      <Head>
        <title>umami{title && ` - ${title}`}</title>
        <link rel="icon" href="favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      {header && <Header />}
      <main className="container">{children}</main>
      {footer && <Footer />}
      <div id="__modals" />
    </>
  );
}
