import { Container } from 'react-basics';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NavBar from 'components/layout/NavBar';
import UpdateNotice from 'components/common/UpdateNotice';
import useRequireLogin from 'hooks/useRequireLogin';
import useConfig from 'hooks/useConfig';
import { UI_LAYOUT_BODY } from 'lib/constants';
import styles from './AppLayout.module.css';

export default function AppLayout({ title, children }) {
  const { user } = useRequireLogin();
  const config = useConfig();
  const { pathname } = useRouter();

  if (!user || !config) {
    return null;
  }

  const allowUpdate = user?.isAdmin && !config?.updatesDisabled && !pathname.includes('/share/');

  return (
    <div className={styles.layout}>
      {allowUpdate && <UpdateNotice />}
      <Head>
        <title>{title ? `${title} | umami` : 'umami'}</title>
      </Head>
      <div className={styles.nav}>
        <NavBar />
      </div>
      <div className={styles.body} id={UI_LAYOUT_BODY}>
        <Container>
          <main>{children}</main>
        </Container>
      </div>
    </div>
  );
}
