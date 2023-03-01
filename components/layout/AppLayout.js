import { Container } from 'react-basics';
import Head from 'next/head';
import NavBar from 'components/layout/NavBar';
import useRequireLogin from 'hooks/useRequireLogin';
import useConfig from 'hooks/useConfig';
import { UI_LAYOUT_BODY } from 'lib/constants';
import styles from './AppLayout.module.css';

export default function AppLayout({ title, children }) {
  const { user } = useRequireLogin();
  const config = useConfig();

  if (!user || !config) {
    return null;
  }

  return (
    <div className={styles.layout}>
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
