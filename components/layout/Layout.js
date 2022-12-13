import { Container } from 'react-basics';
import Head from 'next/head';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import useLocale from 'hooks/useLocale';
import { useRouter } from 'next/router';

export default function Layout({ title, children, header = true, footer = true }) {
  const { dir } = useLocale();
  const { basePath } = useRouter();

  return (
    <Container dir={dir} style={{ maxWidth: 1140 }}>
      <Head>
        <title>{title ? `${title} | umami` : 'umami'}</title>
        <link rel="icon" href={`${basePath}/favicon.ico`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${basePath}/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${basePath}/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${basePath}/favicon-16x16.png`} />
        <link rel="manifest" href={`${basePath}/site.webmanifest`} />
        <link rel="mask-icon" href={`${basePath}/safari-pinned-tab.svg`} color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#2f2f2f" media="(prefers-color-scheme: dark)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {header && <Header />}
      <main>{children}</main>
      {footer && <Footer />}
    </Container>
  );
}
