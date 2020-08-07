import React from 'react';
import classNames from 'classnames';
import Head from 'next/head';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import styles from './Layout.module.css';

export default function Layout({
  title,
  children,
  header = true,
  footer = true,
  center = false,
  middle = false,
}) {
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
      {header && <Header />}
      <main
        className={classNames(styles.layout, 'container', {
          [styles.center]: center,
          [styles.middle]: middle,
        })}
      >
        {children}
      </main>
      {footer && <Footer />}
    </>
  );
}
