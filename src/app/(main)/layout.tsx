import { Metadata } from 'next';
import App from './App';
import NavBar from './NavBar';
import Page from 'components/layout/Page';
import styles from './layout.module.css';

export default function ({ children }) {
  return (
    <App>
      <main className={styles.layout}>
        <nav className={styles.nav}>
          <NavBar />
        </nav>
        <section className={styles.body}>
          <Page>{children}</Page>
        </section>
      </main>
    </App>
  );
}

export const metadata: Metadata = {
  title: {
    template: `%s | ${process.env.NEXT_PUBLIC_CUSTOM_TITLE || 'Umami'}`,
    default: process.env.NEXT_PUBLIC_CUSTOM_TITLE || 'Umami',
  },
};
