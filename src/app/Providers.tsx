'use client';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactBasicsProvider } from 'react-basics';
import ErrorBoundary from 'components/common/ErrorBoundary';
import useLocale from 'components/hooks/useLocale';
import 'chartjs-adapter-date-fns';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function MessagesProvider({ children }) {
  const { locale, messages } = useLocale();
  return (
    <IntlProvider locale={locale} messages={messages[locale]} onError={() => null}>
      {children}
    </IntlProvider>
  );
}

export function Providers({ children }) {
  return (
    <MessagesProvider>
      <QueryClientProvider client={client}>
        <ReactBasicsProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ReactBasicsProvider>
      </QueryClientProvider>
    </MessagesProvider>
  );
}

export default Providers;
