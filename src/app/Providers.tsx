'use client';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactBasicsProvider } from 'react-basics';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useLocale } from '@/components/hooks';
import 'chartjs-adapter-date-fns';
import { useEffect } from 'react';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function MessagesProvider({ children }) {
  const { locale, messages, dir } = useLocale();

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale, dir]);

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
