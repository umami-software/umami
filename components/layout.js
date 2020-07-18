import React from 'react';
import Head from 'next/head';
import Header from 'components/header';
import Footer from 'components/footer';

export default function Layout({ title, children }) {
  return (
    <>
      <Head>
        <title>umami{title && ` - ${title}`}</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&display=swap"
          rel="stylesheet"
        />
        {typeof window !== 'undefined' && (
          <script
            async
            defer
            data-website-id="865234ad-6a92-11e7-8846-b05adad3f099"
            src="/umami.js"
          />
        )}
      </Head>
      <Header />
      <main className="container">{children}</main>
      <Footer />
    </>
  );
}
