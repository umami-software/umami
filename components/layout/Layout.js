import { Container } from 'react-basics';
import Head from 'next/head';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import useLocale from 'hooks/useLocale';

export default function Layout({ title, children, header = true, footer = true }) {
  const { dir } = useLocale();

  return (
    <Container dir={dir} style={{ maxWidth: 1140 }}>
      <Head>
        <title>{title ? `${title} | umami` : 'umami'}</title>
      </Head>
      {header && <Header />}
      <main>{children}</main>
      {footer && <Footer />}
    </Container>
  );
}
