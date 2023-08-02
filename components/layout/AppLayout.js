import { Container } from 'react-basics';
import Head from 'next/head';
import NavBar from 'components/layout/NavBar';
import UpdateNotice from 'components/common/UpdateNotice';
import useRequireLogin from 'hooks/useRequireLogin';
import useConfig from 'hooks/useConfig';
import { CURRENT_VERSION } from 'lib/constants';
import styles from './AppLayout.module.css';

export function AppLayout({ title, children }) {
  const { user } = useRequireLogin();
  const config = useConfig();

  if (!user || !config) {
    return null;
  }

  return (
    <div className={styles.layout} data-app-version={CURRENT_VERSION}>
      <UpdateNotice user={user} config={config} />
      <Head>
        <title>{title ? `${title} | umami` : 'umami'}</title>
      </Head>
      <nav className={styles.nav}>
        <NavBar />
      </nav>
      <main className={styles.body}>
        <Container>{children}</Container>
      </main>
    </div>
  );
}

export default AppLayout;
