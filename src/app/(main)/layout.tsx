import Shell from './Shell';
import NavBar from './NavBar';
import Page from 'components/layout/Page';
import styles from './layout.module.css';

export default function AppLayout({ children }) {
  return (
    <Shell>
      <main className={styles.layout}>
        <nav className={styles.nav}>
          <NavBar />
        </nav>
        <section className={styles.body}>
          <Page>{children}</Page>
        </section>
      </main>
    </Shell>
  );
}
