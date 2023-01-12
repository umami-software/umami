import { Container } from 'react-basics';
import Head from 'next/head';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import useLocale from 'hooks/useLocale';
import useRequireLogin from 'hooks/useRequireLogin';

export default function AppLayout({ title, children }) {
  useRequireLogin();
  const { dir } = useLocale();

  return (
    <Container dir={dir} style={{ maxWidth: 1140 }}>
      <Head>
        <title>{title ? `${title} | umami` : 'umami'}</title>
      </Head>
      <Header />
      <main>{children}</main>
      <Footer />
    </Container>
  );
}
