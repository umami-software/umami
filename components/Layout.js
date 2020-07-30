import React from 'react';
import Head from 'next/head';
import Header from 'components/Header';
import Footer from 'components/Footer';

export default function Layout({ title, children }) {
  return (
    <>
      <Head>
        <title>umami{title && ` - ${title}`}</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header />
      <main className="container">{children}</main>
      <Footer />
    </>
  );
}
