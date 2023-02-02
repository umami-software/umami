import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useLocale from 'hooks/useLocale';
import useConfig from 'hooks/useConfig';
import 'react-basics/dist/styles.css';
import 'styles/variables.css';
import 'styles/locale.css';
import 'styles/index.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }) {
  const { locale, messages } = useLocale();
  const { basePath } = useRouter();
  useConfig();

  const Wrapper = ({ children }) => <span className={locale}>{children}</span>;

  if (process.env.uiDisabled) {
    return null;
  }

  return (
    <QueryClientProvider client={client}>
      <IntlProvider
        locale={locale}
        messages={messages[locale]}
        textComponent={Wrapper}
        onError={() => null}
      >
        <Head>
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
        <Component {...pageProps} />
      </IntlProvider>
    </QueryClientProvider>
  );
}
