import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useLocale from 'hooks/useLocale';
import useConfig from 'hooks/useConfig';
import 'react-basics/dist/styles.css';
import 'styles/variables.css';
import 'styles/index.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';

const client = new QueryClient();

export default function App({ Component, pageProps }) {
  const { locale, messages } = useLocale();
  useConfig();

  const Wrapper = ({ children }) => <span className={locale}>{children}</span>;

  if (process.env.uiDisabled) {
    return null;
  }

  return (
    <QueryClientProvider client={client}>
      <IntlProvider locale={locale} messages={messages[locale]} textComponent={Wrapper}>
        <Component {...pageProps} />
      </IntlProvider>
    </QueryClientProvider>
  );
}
