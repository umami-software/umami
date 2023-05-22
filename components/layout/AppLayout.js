import { Container } from 'react-basics';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NavBar from 'components/layout/NavBar';
import UpdateNotice from 'components/common/UpdateNotice';
import useRequireLogin from 'hooks/useRequireLogin';
import useConfig from 'hooks/useConfig';
import { CURRENT_VERSION } from 'lib/constants';
import styles from './AppLayout.module.css';

export function AppLayout({ title, children }) {
  const { user } = useRequireLogin();
  const config = useConfig();
  const { pathname } = useRouter();

  if (!user || !config) {
    return null;
  }

  const allowUpdate = user?.isAdmin && !config?.updatesDisabled && !pathname.includes('/share/');

  return (
    <div className={styles.layout} data-app-version={CURRENT_VERSION}>
      {allowUpdate && <UpdateNotice />}
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
