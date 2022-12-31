import Layout from 'components/layout/Layout';
import Menu from 'components/nav/Nav';
import useUser from 'hooks/useUser';
import styles from './Settings.module.css';

export default function Settings({ children }) {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.nav}>
          <Menu />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </Layout>
  );
}
